package com.project.blogApp.repositories;

import com.project.blogApp.domain.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    // Change return type to List<Object[]>
    @Query("SELECT c.id, c.name, COUNT(p) FROM Category c LEFT JOIN c.posts p GROUP BY c.id, c.name")
    List<Object[]> findAllWithPostCountSummary();
    boolean existsByNameIgnoreCase(String name);
}