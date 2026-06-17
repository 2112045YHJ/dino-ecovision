package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostRepositoryCustom {
    Page<Post> findAllByQueryDSL(String category, String searchType, String keyword, Pageable pageable);
}
