package com.Omkar.SpringEcom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("your-email@gmail.com"); // Replace with your sending email
        message.setTo(toEmail);
        message.setSubject("OrderStack - Password Reset Request");
        message.setText("Hello,\n\nYou have requested to reset your password. "
                + "Please click the link below to set a new password:\n\n"
                + resetLink
                + "\n\nThis link will expire in 15 minutes.\n"
                + "If you did not request this, please ignore this email.");

        mailSender.send(message);
    }
}