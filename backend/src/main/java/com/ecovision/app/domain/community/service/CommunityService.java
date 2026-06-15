package com.ecovision.app.domain.community.service;

import com.ecovision.app.domain.community.dto.CommunityDto;
import com.ecovision.app.domain.community.entity.*;
import com.ecovision.app.domain.community.repository.*;
import com.ecovision.app.domain.user.entity.PointHistory;
import com.ecovision.app.domain.user.entity.Role;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.repository.PointHistoryRepository;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final ChartSnapshotRepository chartSnapshotRepository;
    private final UserRepository userRepository;
    private final PointHistoryRepository pointHistoryRepository;

    @Transactional
    public Long createPost(CommunityDto.PostRequest request, Long userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        PostCategory category = PostCategory.GENERAL;
        if (request.category() != null) {
            try {
                category = PostCategory.valueOf(request.category().toUpperCase());
            } catch (IllegalArgumentException e) {
                category = PostCategory.GENERAL;
            }
        }

        if (category == PostCategory.NOTICE && author.getRole() != Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "공지사항은 관리자만 작성할 수 있습니다.");
        }

        ChartSnapshot snapshot = null;
        if (request.chartSnapshotId() != null && !request.chartSnapshotId().trim().isEmpty()) {
            snapshot = chartSnapshotRepository.findById(request.chartSnapshotId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "차트 스냅샷을 찾을 수 없습니다."));
        }

        Post post = Post.builder()
                .title(request.title())
                .content(request.content())
                .category(category)
                .user(author)
                .chartSnapshot(snapshot)
                .dinoSnapshot(request.dinoSnapshot())
                .build();

        Post saved = postRepository.save(post);

        // 게시글 작성 포인트 지급 (+100점)
        rewardPoints(author, 100, "POST_WRITE");

        return saved.getId();
    }

    @Transactional(readOnly = true)
    public Page<CommunityDto.PostResponse> getPosts(String categoryStr, String searchType, String keyword, Pageable pageable, Long userId) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            String stripped = keyword.replaceAll("\\s+", "");
            if (stripped.length() < 2) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED, "검색어는 공백을 제외하고 2글자 이상 입력해야 합니다.");
            }
        }

        PostCategory category = null;
        if (categoryStr != null && !categoryStr.trim().isEmpty() && !categoryStr.equalsIgnoreCase("ALL")) {
            try {
                category = PostCategory.valueOf(categoryStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // 무시
            }
        }

        if ((category != null) || (keyword != null && !keyword.trim().isEmpty())) {
            Specification<Post> spec = buildSearchSpecification(category, searchType, keyword);
            return postRepository.findAll(spec, pageable).map(post -> convertToPostResponse(post, userId));
        }

        return postRepository.findAllWithUser(pageable).map(post -> convertToPostResponse(post, userId));
    }

    private Specification<Post> buildSearchSpecification(PostCategory category, String searchType, String keyword) {
        return (root, query, cb) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("user", JoinType.LEFT);
            }

            Predicate predicate = cb.conjunction();
            predicate = cb.and(predicate, cb.isNull(root.get("deletedAt")));

            if (category != null) {
                predicate = cb.and(predicate, cb.equal(root.get("category"), category));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String trimmed = keyword.trim();
                String[] words = trimmed.split("\\s+");

                if (searchType == null || searchType.trim().isEmpty() || searchType.equalsIgnoreCase("ALL")) {
                    for (String word : words) {
                        String pattern = "%" + word + "%";
                        Predicate wordPredicate = cb.or(
                            cb.like(root.get("title"), pattern),
                            cb.like(root.get("content"), pattern),
                            cb.like(root.get("user").get("nickname"), pattern)
                        );
                        predicate = cb.and(predicate, wordPredicate);
                    }
                } else if (searchType.equalsIgnoreCase("TITLE_CONTENT")) {
                    for (String word : words) {
                        String pattern = "%" + word + "%";
                        Predicate wordPredicate = cb.or(
                            cb.like(root.get("title"), pattern),
                            cb.like(root.get("content"), pattern)
                        );
                        predicate = cb.and(predicate, wordPredicate);
                    }
                } else if (searchType.equalsIgnoreCase("TITLE")) {
                    for (String word : words) {
                        String pattern = "%" + word + "%";
                        predicate = cb.and(predicate, cb.like(root.get("title"), pattern));
                    }
                } else if (searchType.equalsIgnoreCase("CONTENT")) {
                    for (String word : words) {
                        String pattern = "%" + word + "%";
                        predicate = cb.and(predicate, cb.like(root.get("content"), pattern));
                    }
                } else if (searchType.equalsIgnoreCase("AUTHOR")) {
                    for (String word : words) {
                        String pattern = "%" + word + "%";
                        predicate = cb.and(predicate, cb.like(root.get("user").get("nickname"), pattern));
                    }
                }
            }

            return predicate;
        };
    }

    @Transactional
    public CommunityDto.PostResponse getPostDetails(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        post.increaseViewCount();

        List<Comment> comments = commentRepository.findByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(id);
        List<CommunityDto.CommentResponse> commentDtos = comments.stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList());

        return convertToPostResponse(post, commentDtos, userId);
    }

    @Transactional
    public void updatePost(Long id, CommunityDto.PostRequest request, Long userId) {
        Post post = postRepository.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        if (!post.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인이 작성한 글만 수정할 수 있습니다.");
        }

        PostCategory category = PostCategory.GENERAL;
        if (request.category() != null) {
            try {
                category = PostCategory.valueOf(request.category().toUpperCase());
            } catch (IllegalArgumentException e) {
                category = PostCategory.GENERAL;
            }
        }

        User author = post.getUser();
        if (category == PostCategory.NOTICE && author.getRole() != Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "공지사항은 관리자만 설정할 수 있습니다.");
        }

        ChartSnapshot snapshot = null;
        if (request.chartSnapshotId() != null && !request.chartSnapshotId().trim().isEmpty()) {
            snapshot = chartSnapshotRepository.findById(request.chartSnapshotId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "차트 스냅샷을 찾을 수 없습니다."));
        }

        post.update(request.title(), request.content(), category, snapshot, request.dinoSnapshot());
    }

    @Transactional
    public void deletePost(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        if (!post.getUser().getId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인 또는 관리자만 삭제할 수 있습니다.");
        }

        // soft delete 처리
        postRepository.save(
            Post.builder()
                .id(post.getId())
                .user(post.getUser())
                .category(post.getCategory())
                .title(post.getTitle())
                .content(post.getContent())
                .chartSnapshot(post.getChartSnapshot())
                .dinoSnapshot(post.getDinoSnapshot())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .createdAt(post.getCreatedAt())
                .deletedAt(LocalDateTime.now())
                .build()
        );
    }

    @Transactional
    public CommunityDto.LikeResponse likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        User voter = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        User author = post.getUser();
        boolean isOwnPost = voter.getId().equals(author.getId());

        Optional<PostLike> postLikeOpt = postLikeRepository.findByUserAndPost(voter, post);
        boolean isLiked;

        if (postLikeOpt.isPresent()) {
            // 이미 좋아요를 누른 상태 -> 좋아요 취소
            postLikeRepository.delete(postLikeOpt.get());
            post.decreaseLikeCount();
            isLiked = false;

            if (!isOwnPost) {
                // 추천 취소 시 포인트 회수 및 복구
                rewardPoints(voter, 1, "LIKE_CANCEL");
                rewardPoints(author, -5, "LIKE_RECEIVED_CANCEL");
            }
        } else {
            // 좋아요 등록
            PostLike like = PostLike.builder()
                    .user(voter)
                    .post(post)
                    .build();
            postLikeRepository.save(like);
            post.increaseLikeCount();
            isLiked = true;

            if (!isOwnPost) {
                // 추천 시 포인트 차감 및 가산
                rewardPoints(voter, -1, "LIKE_SUBMIT");
                rewardPoints(author, 5, "LIKE_RECEIVED");
            }
        }
        postRepository.save(post);
        return new CommunityDto.LikeResponse(post.getLikeCount(), isLiked);
    }

    @Transactional
    public Long createComment(Long postId, CommunityDto.CommentRequest request, Long userId) {
        Post post = postRepository.findById(postId)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        Comment comment = Comment.builder()
                .post(post)
                .user(author)
                .content(request.content())
                .build();

        Comment saved = commentRepository.save(comment);

        // 댓글 작성 포인트 지급 (+30점)
        rewardPoints(author, 30, "COMMENT_WRITE");

        return saved.getId();
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "댓글을 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인 또는 관리자만 삭제할 수 있습니다.");
        }

        // soft delete 처리
        commentRepository.save(
            Comment.builder()
                .id(comment.getId())
                .post(comment.getPost())
                .user(comment.getUser())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .deletedAt(LocalDateTime.now())
                .build()
        );
    }

    @Transactional
    public void updateComment(Long commentId, CommunityDto.CommentRequest request, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "댓글 작성자만 수정할 수 있습니다.");
        }

        comment.updateContent(request.content());
    }

    @Transactional
    public CommunityDto.ChartSnapshotResponse createSnapshot(CommunityDto.ChartSnapshotRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        ChartSnapshot snapshot = ChartSnapshot.builder()
                .user(user)
                .title(request.title())
                .chartType(request.chartType())
                .chartMetadata(request.chartMetadata())
                .build();

        ChartSnapshot saved = chartSnapshotRepository.save(snapshot);

        return convertToChartSnapshotResponse(saved);
    }

    @Transactional(readOnly = true)
    public CommunityDto.ChartSnapshotResponse getSnapshot(String snapshotId) {
        ChartSnapshot snapshot = chartSnapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "차트 스냅샷을 찾을 수 없습니다."));
        return convertToChartSnapshotResponse(snapshot);
    }

    private void rewardPoints(User user, int amount, String reason) {
        user.setTotalPoints(user.getTotalPoints() + amount);
        user.setRankingPoint(user.getRankingPoint() + amount);
        userRepository.save(user);

        PointHistory history = PointHistory.builder()
                .user(user)
                .pointAmount(amount)
                .reason(reason)
                .build();
        pointHistoryRepository.save(history);
    }

    private CommunityDto.PostResponse convertToPostResponse(Post post, Long userId) {
        return convertToPostResponse(post, null, userId);
    }

    private CommunityDto.PostResponse convertToPostResponse(Post post, List<CommunityDto.CommentResponse> comments, Long userId) {
        boolean liked = false;
        if (userId != null) {
            liked = userRepository.findById(userId)
                    .map(u -> postLikeRepository.existsByUserAndPost(u, post))
                    .orElse(false);
        }

        return new CommunityDto.PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCategory().name(),
                post.getUser().getNickname() != null ? post.getUser().getNickname() : "알 수 없음",
                post.getUser().getId(),
                post.getViewCount(),
                post.getLikeCount(),
                post.getComments() != null ? (int) post.getComments().stream().filter(c -> c.getDeletedAt() == null).count() : 0,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getChartSnapshot() != null ? post.getChartSnapshot().getId() : null,
                post.getDinoSnapshot(),
                liked,
                comments
        );
    }

    private CommunityDto.CommentResponse convertToCommentResponse(Comment comment) {
        return new CommunityDto.CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getNickname() != null ? comment.getUser().getNickname() : "알 수 없음",
                comment.getUser().getId(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }

    private CommunityDto.ChartSnapshotResponse convertToChartSnapshotResponse(ChartSnapshot snapshot) {
        return new CommunityDto.ChartSnapshotResponse(
                snapshot.getId(),
                snapshot.getTitle(),
                snapshot.getChartType(),
                snapshot.getChartMetadata(),
                snapshot.getCreatedAt()
        );
    }
}
