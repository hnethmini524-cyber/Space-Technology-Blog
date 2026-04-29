package com.project.blogApp.services;

import com.project.blogApp.domain.dtos.CategoryDto;
import com.project.blogApp.domain.entities.Category;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
	List<CategoryDto> listCategories();
    Category createCategory(Category category);
    void deleteCategory(UUID id);
    Category getCategoryById(UUID id);
}
