package com.project.blogApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.blogApp.domain.entities.Clap;
import com.project.blogApp.domain.entities.Post;
import com.project.blogApp.domain.entities.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClapRepository extends JpaRepository<Clap, UUID> {
    Optional<Clap> findByPostAndUser(Post post, User user);
}
