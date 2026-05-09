package com.project.blogApp.services.impl;

import com.project.blogApp.domain.CreatePostRequest;
import com.project.blogApp.domain.PostStatus;
import com.project.blogApp.domain.UpdatePostRequest;
import com.project.blogApp.domain.entities.Category;
import com.project.blogApp.domain.entities.Clap;
import com.project.blogApp.domain.entities.Post;
import com.project.blogApp.domain.entities.Tag;
import com.project.blogApp.domain.entities.User;
//import com.project.blogApp.exception.ResourceNotFoundException;
import com.project.blogApp.repositories.ClapRepository;
import com.project.blogApp.repositories.PostRepository;
import com.project.blogApp.services.CategoryService;
import com.project.blogApp.services.PostService;
import com.project.blogApp.services.TagService;
import com.project.blogApp.services.UserService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CategoryService categoryService;
    private final ClapRepository clapRepository;
    private final TagService tagService;
    private final UserService userService;

    private static final int WORDS_PER_MINUTE = 200;

    @Override
    public Post getPost(UUID id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post does not exist with ID " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Post> getAllPosts(UUID categoryId, UUID tagId) {
        if(categoryId != null && tagId != null) {
            Category category = categoryService.getCategoryById(categoryId);
            Tag tag = tagService.getTagById(tagId);
            return postRepository.findAllByStatusAndCategoryAndTagsContaining(
                    PostStatus.PUBLISHED,
                    category,
                    tag
            );
        }

        if(categoryId != null) {
            Category category = categoryService.getCategoryById(categoryId);
            return postRepository.findAllByStatusAndCategory(
                    PostStatus.PUBLISHED,
                    category
            );
        }

        if(tagId != null) {
            Tag tag = tagService.getTagById(tagId);
            return postRepository.findAllByStatusAndTagsContaining(
                    PostStatus.PUBLISHED,
                    tag
            );
        }

        return postRepository.findAllByStatus(PostStatus.PUBLISHED);
    }

    @Override
    public List<Post> getDraftPosts(User user) {
        return postRepository.findAllByAuthorAndStatus(user, PostStatus.DRAFT);
    }

    @Override
    @Transactional
    public Post createPost(User user, CreatePostRequest createPostRequest) {
        Post newPost = new Post();
        newPost.setTitle(createPostRequest.getTitle());
        newPost.setContent(createPostRequest.getContent());
        newPost.setImageUrl(createPostRequest.getImageUrl());
        newPost.setStatus(createPostRequest.getStatus());
        newPost.setAuthor(user);
        newPost.setReadingTime(calculateReadingTime(createPostRequest.getContent()));

        Category category = categoryService.getCategoryById(createPostRequest.getCategoryId());
        newPost.setCategory(category);

        Set<UUID> tagIds = createPostRequest.getTagIds();
        List<Tag> tags = tagService.getTagByIds(tagIds);
        newPost.setTags(new HashSet<>(tags));

        return postRepository.save(newPost);
    }

    @Override
    @Transactional
    public Post updatePost(UUID id, UpdatePostRequest updatePostRequest, User currentUser) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post does not exist with id " + id));
        
        if (!existingPost.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to edit this post");
        }

        existingPost.setTitle(updatePostRequest.getTitle());
        String postContent = updatePostRequest.getContent();
        existingPost.setImageUrl(updatePostRequest.getImageUrl());
        existingPost.setContent(postContent);
        existingPost.setStatus(updatePostRequest.getStatus());
        existingPost.setReadingTime(calculateReadingTime(postContent));

        UUID updatePostRequestCategoryId = updatePostRequest.getCategoryId();
        if(!existingPost.getCategory().getId().equals(updatePostRequestCategoryId)) {
            Category newCategory = categoryService.getCategoryById(updatePostRequestCategoryId);
            existingPost.setCategory(newCategory);
        }

        Set<UUID> existingTagIds = existingPost.getTags().stream().map(Tag::getId).collect(Collectors.toSet());
        Set<UUID> updatePostRequestTagIds = updatePostRequest.getTagIds();
        if(!existingTagIds.equals(updatePostRequestTagIds)) {
            List<Tag> newTags = tagService.getTagByIds(updatePostRequestTagIds);
            existingPost.setTags(new HashSet<>(newTags));
        }

        return postRepository.save(existingPost);
    }

    @Override
    public void deletePost(UUID id, User currentUser) {
        Post post = getPost(id);
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this post");
        }
        postRepository.delete(post);
    }

    private Integer calculateReadingTime(String content) {
        if(content == null || content.isEmpty()) {
            return 0;
        }

        int wordCount = content.trim().split("\\s+").length;
        return (int) Math.ceil((double) wordCount / WORDS_PER_MINUTE);
    }
    
    @Override
    public List<Post> getPublishedPostsByUser(User user) {
        return postRepository.findAllByAuthorAndStatus(user, PostStatus.PUBLISHED);
    }

    
    @Override
    @Transactional
    public int clapPost(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        User user = userService.getUserById(userId);

        // Try to find the existing record
        Clap clap = clapRepository.findByPostAndUser(post, user)
                .orElseGet(() -> {
                    // If not found, create a new one but be prepared for a collision
                    return Clap.builder()
                            .post(post)
                            .user(user)
                            .count(0)
                            .build();
                });

        if (clap.getCount() >= 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum claps reached.");
        }

        clap.setCount(clap.getCount() + 1);
        post.setClapCount(post.getClapCount() + 1);

        try {
            clapRepository.saveAndFlush(clap); // Force immediate write to catch the error here
            postRepository.save(post);
        } catch (DataIntegrityViolationException e) {
            // This catches the 'fast click' duplicate insert.
            // We simply fetch the record that the OTHER request just created and update it instead.
            Clap actualClap = clapRepository.findByPostAndUser(post, user)
                    .orElseThrow(() -> e); // Rethrow if it's a different integrity issue
            actualClap.setCount(actualClap.getCount() + 1);
            clapRepository.save(actualClap);
        }
        
        return post.getClapCount(); 
    }

}
