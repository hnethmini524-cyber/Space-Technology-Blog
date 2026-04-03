package com.project.blogApp.domain.dtos;

import java.time.LocalDateTime;

import com.project.blogApp.domain.entities.Comment;
import java.util.UUID;
import lombok.Data;

@Data
public class CommentResponseDto {
    private UUID id;
    private String content;
    private String userName;
    private int likes;
    private LocalDateTime createdAt;

    public CommentResponseDto(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.userName = comment.getUser().getName();
        this.likes = comment.getLikes();
        this.createdAt = comment.getCreatedAt();
    }
}
