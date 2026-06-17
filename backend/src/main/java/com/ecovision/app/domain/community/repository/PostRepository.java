package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.Post;
import com.ecovision.app.domain.community.entity.PostCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post>, PostRepositoryCustom {

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.user WHERE p.deletedAt IS NULL ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(p) FROM Post p WHERE p.deletedAt IS NULL")
    Page<Post> findAllWithUser(Pageable pageable);

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.user WHERE p.category = :category AND p.deletedAt IS NULL ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(p) FROM Post p WHERE p.category = :category AND p.deletedAt IS NULL")
    Page<Post> findAllByCategoryWithUser(@Param("category") PostCategory category, Pageable pageable);

    List<Post> findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);
}
