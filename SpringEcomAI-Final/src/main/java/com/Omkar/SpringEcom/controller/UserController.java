package com.Omkar.SpringEcom.controller;

import com.Omkar.SpringEcom.model.User;
import com.Omkar.SpringEcom.repo.UserRepo;
import com.Omkar.SpringEcom.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepo userRepo; // Inject the repo
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {

        // 1. Find the user in the database by their email
        User existingUser = userRepo.findByEmail(loginRequest.getEmail());

        // 2. Check if user exists AND password matches
        if (existingUser != null && passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())) {

            // 3. For security, don't send the password back to React
            existingUser.setPassword(null);

            // Return 200 OK and the user data
            return new ResponseEntity<>(existingUser, HttpStatus.OK);
        } else {
            // Return 401 Unauthorized if email or password is wrong
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> allUsers = userRepo.findAll();

        // Security check: Clear passwords before sending to the frontend
        for (User user : allUsers) {
            user.setPassword(null);
        }

        return new ResponseEntity<>(allUsers, HttpStatus.OK);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepo.findById(id)
                .map(user -> {
                    user.setPassword(null); // Keep it secure
                    return new ResponseEntity<>(user, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}