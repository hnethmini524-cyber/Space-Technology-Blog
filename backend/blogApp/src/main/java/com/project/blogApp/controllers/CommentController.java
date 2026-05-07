package com.project.blogApp.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.blogApp.domain.dtos.CommentRequestDto;
import com.project.blogApp.domain.dtos.CommentResponseDto;
import com.project.blogApp.services.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponseDto>> getComments(@PathVariable("postId") UUID postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponseDto> addComment(
            @PathVariable("postId") UUID postId,
            @Valid @RequestBody CommentRequestDto request,
            @RequestAttribute("userId") UUID userId) { 
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(postId, userId, request));
    }
    
    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<CommentResponseDto> likeComment(@PathVariable("commentId") UUID commentId) {
        CommentResponseDto updated = commentService.likeComment(commentId);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable("commentId") UUID commentId, @RequestAttribute("userId") UUID userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}