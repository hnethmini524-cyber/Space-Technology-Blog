package com.project.blogApp.services.impl;

import com.project.blogApp.domain.dtos.CategoryDto;
import com.project.blogApp.domain.entities.Category;
import com.project.blogApp.repositories.CategoryRepository;
import com.project.blogApp.services.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryDto> listCategories() {
        List<Object[]> results = categoryRepository.findAllWithPostCountSummary();
        
        return results.stream().map(result -> 
            CategoryDto.builder()
                .id((UUID) result[0])       // ID from query
                .name((String) result[1])    // Name from query
                .postCount((Long) result[2]) // Count from query
                .build()
        ).toList();
    }

    @Override
    @Transactional
    public Category createCategory(Category category) {
        String categoryName = category.getName();
        if(categoryRepository.existsByNameIgnoreCase(categoryName)) {
            throw new IllegalArgumentException("Category already exists with name: " + categoryName);
        }
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(UUID id) {
        Optional<Category> category = categoryRepository.findById(id);
        if(category.isPresent()) {
            if(!category.get().getPosts().isEmpty()) {
                throw new IllegalStateException("Category has posts associated with it");
            }
            categoryRepository.deleteById(id);
        }
    }

    @Override
    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id" + id));
    }

}