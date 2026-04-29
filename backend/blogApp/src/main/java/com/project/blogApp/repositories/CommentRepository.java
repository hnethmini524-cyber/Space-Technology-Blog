package com.project.blogApp.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.blogApp.domain.entities.Comment;
//import com.project.blogApp.domain.entities.Post;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

	@Modifying
    @Query("UPDATE Comment c SET c.likes = c.likes + 1 WHERE c.id = :id")
    void incrementLikes(@Param("id") UUID id);

    List<Comment> findByPostIdOrderByCreatedAtDesc(UUID postId);
}
