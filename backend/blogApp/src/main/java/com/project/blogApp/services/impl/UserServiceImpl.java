package com.project.blogApp.services.impl;

import com.project.blogApp.domain.dtos.UserDto;
import com.project.blogApp.domain.entities.User;
import com.project.blogApp.repositories.UserRepository;
import com.project.blogApp.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getUserById(UUID id) {
        return userRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }
    
    @Override
    public UserDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        // Map the Entity to DTO
        return UserDto.builder()
                .userId(user.getId().toString())
                .userName(user.getName()) 
                .email(user.getEmail())
                .createdAt(user.getCreatedAt().toString())
                .build();
    }

}
