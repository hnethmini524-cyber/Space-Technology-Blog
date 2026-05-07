package com.project.blogApp.controllers;

import com.project.blogApp.domain.CreatePostRequest;
import com.project.blogApp.domain.UpdatePostRequest;
import com.project.blogApp.domain.dtos.CreatePostRequestDto;
import com.project.blogApp.domain.dtos.PostDto;
import com.project.blogApp.domain.dtos.UpdatePostRequestDto;
import com.project.blogApp.domain.entities.Post;
import com.project.blogApp.domain.entities.User;
import com.project.blogApp.mappers.PostMapper;
import com.project.blogApp.services.PostService;
import com.project.blogApp.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final PostMapper postMapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts(
            @RequestParam(name = "categoryId",required = false) UUID categoryId,
            @RequestParam(name = "tagId",required = false) UUID tagId) {
        List<Post> posts = postService.getAllPosts(categoryId, tagId);
        List<PostDto> postDtos = posts.stream().map(postMapper::toDto).toList();
        return ResponseEntity.ok(postDtos);
    }

    @GetMapping(path = "/drafts")
    public ResponseEntity<List<PostDto>> getDrafts(@RequestAttribute("userId") UUID userId) {
        User loggedInUser = userService.getUserById(userId);
        List<Post> draftPosts = postService.getDraftPosts(loggedInUser);
        List<PostDto> postDtos = draftPosts.stream().map(postMapper::toDto).toList();
        return ResponseEntity.ok(postDtos);
    }

    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody CreatePostRequestDto createPostRequestDto,
            @RequestAttribute("userId") UUID userId) {
        User loggedInUser = userService.getUserById(userId);
        CreatePostRequest createPostRequest = postMapper.toCreatePostRequest(createPostRequestDto);
        Post createdPost = postService.createPost(loggedInUser, createPostRequest);
        PostDto createdPostDto = postMapper.toDto(createdPost);
        return new ResponseEntity<>(createdPostDto, HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdatePostRequestDto updatePostRequestDto, @RequestAttribute UUID userId) {
    	User user = userService.getUserById(userId);
        UpdatePostRequest updatePostRequest = postMapper.toUpdatePostRequest(updatePostRequestDto);
        Post updatedPost = postService.updatePost(id, updatePostRequest, user);
        PostDto updatedPostDto = postMapper.toDto(updatedPost);
        return ResponseEntity.ok(updatedPostDto);
    }

    @GetMapping(path = "/{id}")
    public ResponseEntity<PostDto> getPost(
            @PathVariable("id") UUID id
    ) {
        Post post = postService.getPost(id);
        PostDto postDto = postMapper.toDto(post);
        return ResponseEntity.ok(postDto);
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable("id") UUID id, @RequestAttribute("userId") UUID userId) {
    	User currentUser = userService.getUserById(userId);
        postService.deletePost(id, currentUser);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping(path = "/me")
    public ResponseEntity<List<PostDto>> getMyPublishedPosts(@RequestAttribute("userId") UUID userId) {
        User loggedInUser = userService.getUserById(userId);
        List<Post> posts = postService.getPublishedPostsByUser(loggedInUser); 
        List<PostDto> postDtos = posts.stream().map(postMapper::toDto).toList();
        return ResponseEntity.ok(postDtos);
    }
    
    @PatchMapping(path = "/{id}/clap")
    public ResponseEntity<Map<String, Integer>> clapPost(@PathVariable("id") UUID id, @RequestAttribute("userId") UUID userId) {     
        int newCount = postService.clapPost(id, userId);
        return ResponseEntity.ok(Map.of("clapCount", newCount));
    }

}