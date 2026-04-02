package com.project.blogApp.services;

import org.springframework.security.core.userdetails.UserDetails;

import com.project.blogApp.domain.dtos.AuthResponse;
import com.project.blogApp.domain.dtos.RegisterRequest;

public interface AuthenticationService {
	AuthResponse register(RegisterRequest request);
    UserDetails authenticate(String email, String password);
    String generateToken(UserDetails userDetails);
    UserDetails validateToken(String token);
}
