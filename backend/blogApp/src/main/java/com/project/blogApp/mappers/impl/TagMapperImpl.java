package com.project.blogApp.mappers.impl;

import com.project.blogApp.domain.dtos.TagDto;
import com.project.blogApp.domain.entities.Tag;
import com.project.blogApp.mappers.TagMapper;
import org.springframework.stereotype.Component;

@Component
public class TagMapperImpl implements TagMapper {

    @Override
    public TagDto toTagResponse(Tag tag) {
        if (tag == null) return null;

        return TagDto.builder()
                .id(tag.getId())
                .name(tag.getName())
                // Safely calculate post count for the frontend bubbles
                .postCount(tag.getPosts() != null ? tag.getPosts().size() : 0)
                .build();
    }
}
