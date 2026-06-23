package com.ecovision.app.domain.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public final class CommunityDto {

    private CommunityDto() {}

    // 1. 게시글 관련 DTO
    public record PostRequest(
            @NotBlank(message = "제목은 필수입니다.")
            @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
            String title,

            @NotBlank(message = "내용은 필수입니다.")
            String content,

            String category, // NOTICE, GENERAL, INFO_SHARE

            String chartSnapshotId, // UUID String

            String dinoSnapshot // JSON String
    ) {}

    public record PostResponse(
            Long id,
            String title,
            String content,
            String category,
            String authorNickname,
            Long authorId,
            int viewCount,
            int likeCount,
            int commentCount,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String chartSnapshotId,
            String dinoSnapshot,
            boolean liked,
            String authorAvatarUrl,
            List<CommentResponse> comments
    ) {}

    public record LikeResponse(
            int likeCount,
            boolean liked
    ) {}

    // 2. 댓글 관련 DTO
    public record CommentRequest(
            @NotBlank(message = "댓글 내용은 필수입니다.")
            @Size(max = 1000, message = "댓글은 1000자 이하여야 합니다.")
            String content
    ) {}

    public record CommentResponse(
            Long id,
            String content,
            String authorNickname,
            Long authorId,
            String authorAvatarUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    // 3. 차트 스냅샷 관련 DTO
    public record ChartSnapshotRequest(
            @Size(max = 200, message = "차트 스냅샷 제목은 200자 이하여야 합니다.")
            String title,

            @NotBlank(message = "차트 종류는 필수입니다.")
            String chartType,

            @NotBlank(message = "차트 메타데이터는 필수입니다.")
            String chartMetadata, // JSON String

            Boolean isSaved
    ) {}

    public record ChartSnapshotResponse(
            String id, // UUID String
            String title,
            String chartType,
            String chartMetadata,
            LocalDateTime createdAt
    ) {}
}
