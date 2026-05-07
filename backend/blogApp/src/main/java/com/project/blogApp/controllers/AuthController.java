package com.project.blogApp.controllers;
import com.project.blogApp.domain.dtos.AuthResponse;
import com.project.blogApp.domain.dtos.LoginRequest;
import com.project.blogApp.domain.dtos.RegisterRequest;
//import com.project.blogApp.domain.entities.User;
//import com.project.blogApp.repositories.UserRepository;
//import com.project.blogApp.security.BlogUserDetails;
import com.project.blogApp.services.AuthenticationService;
import com.project.blogApp.services.PasswordResetService;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        UserDetails userDetails = authenticationService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
        String tokenValue = authenticationService.generateToken(userDetails);
        
        //BlogUserDetails blogUserDetails = (BlogUserDetails) userDetails;
        
        AuthResponse authResponse = AuthResponse.builder()
                .token(tokenValue)
                .expiresIn(86400)
                .build();
        return ResponseEntity.ok(authResponse);
    }
    
    @PostMapping("/register") 
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        // This calls the register method we fixed in your AuthenticationServiceImpl
        AuthResponse response = authenticationService.register(registerRequest);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        // This will be accessible at /api/v1/auth/forgot-password
        passwordResetService.createPasswordResetToken(request.get("email"));
        return ResponseEntity.ok(Map.of("message", "Recovery email sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        // This will be accessible at /api/v1/auth/reset-password
        passwordResetService.resetPassword(request.get("token"), request.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }
}