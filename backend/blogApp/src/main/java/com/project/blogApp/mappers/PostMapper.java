package com.project.blogApp.mappers;

import com.project.blogApp.domain.CreatePostRequest;
import com.project.blogApp.domain.UpdatePostRequest;
import com.project.blogApp.domain.dtos.CreatePostRequestDto;
import com.project.blogApp.domain.dtos.PostDto;
import com.project.blogApp.domain.dtos.UpdatePostRequestDto;
import com.project.blogApp.domain.entities.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PostMapper {

    @Mapping(target = "author", source = "author")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "tags", source = "tags")
    @Mapping(target = "status", source = "status")
    PostDto toDto(Post post);

    CreatePostRequest toCreatePostRequest(CreatePostRequestDto dto);

    UpdatePostRequest toUpdatePostRequest(UpdatePostRequestDto dto);

}
