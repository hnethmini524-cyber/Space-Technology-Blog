package com.project.blogApp.services;

import com.project.blogApp.domain.CreatePostRequest;
import com.project.blogApp.domain.UpdatePostRequest;
import com.project.blogApp.domain.entities.Post;
import com.project.blogApp.domain.entities.User;

import java.util.List;
import java.util.UUID;
public interface PostService {
    Post getPost(UUID id);
    List<Post> getAllPosts(UUID categoryId, UUID tagId);
    List<Post> getDraftPosts(User user);
    Post createPost(User user, CreatePostRequest createPostRequest);
    Post updatePost(UUID id, UpdatePostRequest updatePostRequest, User user);
    void deletePost(UUID id, User user);
}