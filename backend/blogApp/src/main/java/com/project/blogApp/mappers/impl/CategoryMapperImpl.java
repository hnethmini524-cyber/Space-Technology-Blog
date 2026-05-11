package com.project.blogApp.mappers.impl;

import com.project.blogApp.domain.dtos.CategoryDto;
import com.project.blogApp.domain.dtos.CreateCategoryRequest;
import com.project.blogApp.domain.entities.Category;
import com.project.blogApp.mappers.CategoryMapper;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapperImpl implements CategoryMapper {

  @Override
  public CategoryDto toDto(Category category) {
    if (category == null) return null;
    
    return CategoryDto.builder()
        .id(category.getId())
        .name(category.getName())
        // PostCount calculate here
        .postCount(category.getPosts() != null ? category.getPosts().size() : 0)
        .build();
  }

  @Override
  public Category toEntity(CreateCategoryRequest createCategoryRequest) {
    if (createCategoryRequest == null) return null;

    // This converts the Request DTO from React into a Database Entity
    return Category.builder()
        .name(createCategoryRequest.getName())
        .build();
  }
}
