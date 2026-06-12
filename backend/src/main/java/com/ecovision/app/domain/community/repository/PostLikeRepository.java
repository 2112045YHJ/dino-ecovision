package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.Post;
import com.ecovision.app.domain.community.entity.PostLike;
import com.ecovision.app.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByUserAndPost(User user, Post post);
    boolean existsByUserAndPost(User user, Post post);
}
