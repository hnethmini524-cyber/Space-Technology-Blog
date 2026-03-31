package com.project.blogApp.mappers;

import com.project.blogApp.domain.dtos.CategoryDto;
import com.project.blogApp.domain.dtos.CreateCategoryRequest;
import com.project.blogApp.domain.entities.Category;

public interface CategoryMapper {

    CategoryDto toDto(Category category);

    Category toEntity(CreateCategoryRequest createCategoryRequest);

}
