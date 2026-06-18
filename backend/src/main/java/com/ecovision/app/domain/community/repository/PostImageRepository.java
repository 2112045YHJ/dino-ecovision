package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.PostImage;
import com.ecovision.app.domain.community.entity.PostImageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    Optional<PostImage> findByImageUrl(String imageUrl);
    List<PostImage> findAllByStatusAndCreatedAtBefore(PostImageStatus status, LocalDateTime dateTime);
    List<PostImage> findAllByPostId(Long postId);
}
