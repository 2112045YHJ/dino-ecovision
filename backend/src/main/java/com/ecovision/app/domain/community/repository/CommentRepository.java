package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(Long postId);
    List<Comment> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);
}
