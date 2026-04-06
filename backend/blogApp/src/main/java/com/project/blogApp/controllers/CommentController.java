package com.project.blogApp.controllers;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.blogApp.domain.dtos.CommentResponseDto;
import com.project.blogApp.domain.entities.Comment;
import com.project.blogApp.domain.entities.Post;
import com.project.blogApp.domain.entities.User;
import com.project.blogApp.exception.ResourceNotFoundException;
import com.project.blogApp.repositories.CommentRepository;
import com.project.blogApp.repositories.PostRepository;
import com.project.blogApp.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponseDto>> getComments(@PathVariable UUID postId) {
        List<CommentResponseDto> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponseDto> addComment(
            @PathVariable UUID postId,
            @RequestBody Map<String, String> request,
            Principal principal) { // Principal gets the logged-in user from the JWT
    	
    	//UUID postUuid = UUID.fromString(postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        // Get the current user from the database using the name in the JWT
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setContent(request.get("content"));
        comment.setPost(post);
        comment.setUser(user);

        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.ok(new CommentResponseDto(savedComment));
    }
    
    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<CommentResponseDto> likeComment(@PathVariable UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        
        comment.setLikes(comment.getLikes() + 1);
        Comment updatedComment = commentRepository.save(comment);
        
        return ResponseEntity.ok(new CommentResponseDto(updatedComment));
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId, Principal principal) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Security check: Only the comment owner can delete it
        if (!comment.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }
}
