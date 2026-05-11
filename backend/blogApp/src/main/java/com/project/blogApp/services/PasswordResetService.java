package com.project.blogApp.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.blogApp.domain.entities.PasswordResetToken;
import com.project.blogApp.domain.entities.User;
import com.project.blogApp.repositories.PasswordResetTokenRepository;
import com.project.blogApp.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public void createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate unique token
        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken(token, user);
        tokenRepository.save(myToken);

        // Build the deployment-ready link
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        
        emailService.sendSimpleMessage(
            user.getEmail(), 
            "Reset Your Space Blog Password", 
            "Click here to reset your password: " + resetUrl
        );
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid Token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token Expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Security: Delete token after successful use
        tokenRepository.delete(resetToken);
    }
}
