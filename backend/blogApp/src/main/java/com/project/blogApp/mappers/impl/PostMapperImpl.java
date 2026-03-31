package com.project.blogApp.mappers.impl;

import com.project.blogApp.domain.CreatePostRequest;
import com.project.blogApp.domain.UpdatePostRequest;
import com.project.blogApp.domain.dtos.AuthorDto;
import com.project.blogApp.domain.dtos.CreatePostRequestDto;
import com.project.blogApp.domain.dtos.PostDto;
import com.project.blogApp.domain.dtos.UpdatePostRequestDto;
import com.project.blogApp.domain.entities.Post;
import com.project.blogApp.mappers.CategoryMapper;
import com.project.blogApp.mappers.PostMapper;
import com.project.blogApp.mappers.TagMapper;

import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PostMapperImpl implements PostMapper {
	
	private final CategoryMapper categoryMapper;
	private final TagMapper tagMapper;

	public PostMapperImpl(CategoryMapper categoryMapper,TagMapper tagMapper) {
	    this.categoryMapper = categoryMapper;
	    this.tagMapper = tagMapper;
	}

    @Override
    public PostDto toDto(Post post) {
        if (post == null) return null;

        return PostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .status(post.getStatus())
                .readingTime(post.getReadingTime())
                .createdAt(post.getCreatedAt())
                // Mapping the nested Category
                //.category(post.getCategory() != null ? post.getCategory().getName() : "Uncategorized")
                .author(post.getAuthor() != null ? AuthorDto.builder() .id(post.getAuthor().getId()) .name(post.getAuthor().getName()).build() : null)
                .category(categoryMapper.toDto(post.getCategory()))
                // Mapping the nested Tags
                .tags(post.getTags() != null ? 
                    post.getTags().stream().map(tagMapper::toTagResponse).collect(Collectors.toSet()) 
                    : null)
                .build();
    }

    @Override
    public CreatePostRequest toCreatePostRequest(CreatePostRequestDto dto) {
        if (dto == null) return null;

        return CreatePostRequest.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .categoryId(dto.getCategoryId())
                .tagIds(dto.getTagIds())
                .status(dto.getStatus())
                .build();
    }

    @Override
    public UpdatePostRequest toUpdatePostRequest(UpdatePostRequestDto dto) {
        if (dto == null) return null;

        return UpdatePostRequest.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .categoryId(dto.getCategoryId())
                .tagIds(dto.getTagIds())
                .status(dto.getStatus())
                .build();
    }
}