package com.project.blogApp.repositories;

import com.project.blogApp.domain.PostStatus;
import com.project.blogApp.domain.entities.Category;
import com.project.blogApp.domain.entities.Post;
import com.project.blogApp.domain.entities.Tag;
import com.project.blogApp.domain.entities.User;
//import com.project.blogApp.services.PostService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    List<Post> findAllByStatusAndCategoryAndTagsContaining(PostStatus status, Category category, Tag tag);
    List<Post> findAllByStatusAndCategory(PostStatus status, Category category);
    List<Post> findAllByStatusAndTagsContaining(PostStatus status, Tag tag);
    List<Post> findAllByStatus(PostStatus status);
    List<Post> findAllByAuthorAndStatus(User author, PostStatus status);
	Optional<Post> findById(Long postId);
}