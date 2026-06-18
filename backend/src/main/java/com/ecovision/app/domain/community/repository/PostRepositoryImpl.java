package com.ecovision.app.domain.community.repository;

import com.ecovision.app.domain.community.entity.Post;
import com.ecovision.app.domain.community.entity.PostCategory;
import com.ecovision.app.domain.community.entity.QPost;
import com.ecovision.app.domain.user.entity.QUser;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Post> findAllByQueryDSL(String category, String searchType, String keyword, Pageable pageable) {
        QPost post = QPost.post;
        QUser user = QUser.user;

        BooleanExpression predicate = post.deletedAt.isNull();

        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL")) {
            try {
                PostCategory postCategory = PostCategory.valueOf(category.toUpperCase());
                predicate = predicate.and(post.category.eq(postCategory));
            } catch (IllegalArgumentException e) {
                // 무시
            }
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            predicate = predicate.and(buildSearchPredicate(searchType, keyword, post, user));
        }

        List<Post> content = queryFactory
                .selectFrom(post)
                .leftJoin(post.user, user).fetchJoin() // 작성자 fetch join하여 N+1 문제 해결
                .where(predicate)
                .orderBy(post.createdAt.desc()) // 최신순 정렬 기본
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(post.count())
                .from(post)
                .leftJoin(post.user, user)
                .where(predicate);

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    private BooleanExpression buildSearchPredicate(String searchType, String keyword, QPost post, QUser user) {
        String trimmed = keyword.trim();
        String[] words = trimmed.split("\\s+");
        BooleanExpression result = null;

        for (String word : words) {
            String pattern = "%" + word + "%";
            BooleanExpression wordExpression = null;

            if (searchType == null || searchType.trim().isEmpty() || searchType.equalsIgnoreCase("ALL")) {
                wordExpression = post.title.like(pattern)
                        .or(post.content.like(pattern))
                        .or(user.nickname.like(pattern));
            } else if (searchType.equalsIgnoreCase("TITLE_CONTENT")) {
                wordExpression = post.title.like(pattern)
                        .or(post.content.like(pattern));
            } else if (searchType.equalsIgnoreCase("TITLE")) {
                wordExpression = post.title.like(pattern);
            } else if (searchType.equalsIgnoreCase("CONTENT")) {
                wordExpression = post.content.like(pattern);
            } else if (searchType.equalsIgnoreCase("AUTHOR")) {
                wordExpression = user.nickname.like(pattern);
            }

            if (wordExpression != null) {
                if (result == null) {
                    result = wordExpression;
                } else {
                    result = result.and(wordExpression);
                }
            }
        }

        return result;
    }
}
