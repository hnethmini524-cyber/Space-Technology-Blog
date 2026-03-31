package com.project.blogApp.services;

import com.project.blogApp.domain.entities.User;
import java.util.UUID;

public interface UserService {
    User getUserById(UUID id);
}