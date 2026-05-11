package com.project.blogApp.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.project.blogApp.domain.dtos.CommentRequestDto;
import com.project.blogApp.domain.dtos.CommentResponseDto;
import com.project.blogApp.domain.entities.Comment;
import com.project.blogApp.domain.entities.Post;
import com.project.blogApp.domain.entities.User;
import com.project.blogApp.repositories.CommentRepository;
import com.project.blogApp.repositories.PostRepository;
import com.project.blogApp.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public List<CommentResponseDto> getCommentsByPost(UUID postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponseDto addComment(UUID postId, UUID userId, CommentRequestDto request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .likes(0)
                .build();

        return new CommentResponseDto(commentRepository.save(comment));
    }

    @Transactional
    public CommentResponseDto likeComment(UUID commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new EntityNotFoundException("Comment not found");
        }
        
        // Perform atomic increment
        commentRepository.incrementLikes(commentId);
        Comment updatedComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
                
        return new CommentResponseDto(updatedComment);
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        // Security: Logic check moved to service
        if (!comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
