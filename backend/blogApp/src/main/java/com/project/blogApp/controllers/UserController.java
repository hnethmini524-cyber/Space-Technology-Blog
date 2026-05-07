package com.project.blogApp.controllers;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.blogApp.domain.dtos.UserDto;
import com.project.blogApp.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Principal principal) {
        // principal.getName() retrieves the email/username from the JWT
        UserDto userProfile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(userProfile);
    }
}