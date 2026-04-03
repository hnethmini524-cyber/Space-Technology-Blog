package com.project.blogApp.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.blogApp.domain.entities.Comment;
import com.project.blogApp.domain.entities.Post;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    // Finds all comments for a specific post, sorted by newest first
    List<Comment> findByPostIdOrderByCreatedAtDesc(UUID postId);
}
