package com.project.blogApp.domain.dtos;

//import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private long expiresIn;
    private String userId;   // Changed to String for easier JSON mapping
    private String userName;
}