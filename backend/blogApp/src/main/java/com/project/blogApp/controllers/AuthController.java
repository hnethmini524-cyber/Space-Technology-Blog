package com.project.blogApp.controllers;
import com.project.blogApp.domain.dtos.AuthResponse;
import com.project.blogApp.domain.dtos.LoginRequest;
import com.project.blogApp.domain.dtos.RegisterRequest;
//import com.project.blogApp.domain.entities.User;
//import com.project.blogApp.repositories.UserRepository;
import com.project.blogApp.security.BlogUserDetails;
import com.project.blogApp.services.AuthenticationService;

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

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        UserDetails userDetails = authenticationService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
        String tokenValue = authenticationService.generateToken(userDetails);
        
        BlogUserDetails blogUserDetails = (BlogUserDetails) userDetails;
        
        AuthResponse authResponse = AuthResponse.builder()
                .token(tokenValue)
                .expiresIn(86400)
                //.userId(user.getId().toString())
                .userId(blogUserDetails.getId().toString())
                .build();
        return ResponseEntity.ok(authResponse);
    }
    
    @PostMapping("/register") 
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        // This calls the register method we fixed in your AuthenticationServiceImpl
        AuthResponse response = authenticationService.register(registerRequest);
        return ResponseEntity.ok(response);
    }
}