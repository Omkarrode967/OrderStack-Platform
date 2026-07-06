package com.Omkar.SpringEcom.service;

import com.Omkar.SpringEcom.model.User;
import com.Omkar.SpringEcom.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private EmailService emailService;

    // Added this so you can securely hash the new password!
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepo.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with this email already exists.");
        }

        // --- NEW LINE: Hash the password before saving! ---
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 1. Assign the role dynamically based on the email
        user.setRole(getUserRole(user.getEmail()));

        return userRepo.save(user);
    }

    // Hardcode your email as the Admin to bypass the DB column issue for now
    public String getUserRole(String email) {
        if ("omkarrode24@gmail.com".equals(email)) {
            return "ADMIN";
        }
        return "USER";
    }

    // METHOD 1: Generate Token & Send Email
    public void initiatePasswordReset(String email) {
        User user = userRepo.findByEmail(email);
        if (user == null) {
            // For security, don't throw an error if the email doesn't exist,
            // just return silently so hackers can't fish for valid emails.
            return;
        }

        // 1. Generate a secure random token
        String token = UUID.randomUUID().toString();

        // 2. Set expiry (e.g., 15 minutes from now)
        user.setResetToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepo.save(user);

        // 3. Send the email with the React frontend URL
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    } // <-- Properly closed this method before starting the next one!

    // METHOD 2: Validate Token & Save New Password
    public void resetPassword(String token, String newPassword) {
        User user = userRepo.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        // Check if token is expired
        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        // Update password (securely encoded!)
        user.setPassword(passwordEncoder.encode(newPassword));

        // Clear the token so it can't be reused
        user.setResetToken(null);
        user.setTokenExpiry(null);

        userRepo.save(user);
    }
}