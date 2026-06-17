package com.ecovision.app.domain.community.controller;

import com.ecovision.app.domain.community.dto.CommunityDto;
import com.ecovision.app.domain.community.service.CommunityService;
import com.ecovision.app.domain.community.service.ImageUploadService;
import com.ecovision.app.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Community Post API", description = "커뮤니티 게시글 및 댓글 관리 API")
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final CommunityService communityService;
    private final ImageUploadService imageUploadService;

    @Operation(summary = "본문 이미지 파일 업로드", description = "글 본문용 이미지 파일을 로컬 디렉토리에 업로드하고 정적 파일 접근 URL 경로를 반환합니다.")
    @PostMapping("/images")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        String imageUrl = imageUploadService.uploadImage(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(imageUrl));
    }

    @Operation(summary = "게시글 작성", description = "카테고리별 새로운 게시글을 작성합니다. (포인트 +100점 지급)")
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createPost(
            @Valid @RequestBody CommunityDto.PostRequest request,
            @AuthenticationPrincipal Long userId) {
        Long postId = communityService.createPost(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(postId));
    }

    @Operation(summary = "게시글 목록 조회 및 검색", description = "카테고리별 필터링 및 제목/본문/닉네임 키워드 검색을 포함한 게시글 목록을 페이징 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<CommunityDto.PostResponse>>> getPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String keyword,
            @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<CommunityDto.PostResponse> posts = communityService.getPosts(category, searchType, keyword, pageable, userId);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @Operation(summary = "게시글 상세 조회", description = "특정 ID의 게시글 상세 정보 및 소속 댓글 리스트를 조회합니다. (조회수 +1 증가)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityDto.PostResponse>> getPostDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        CommunityDto.PostResponse details = communityService.getPostDetails(id, userId);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    @Operation(summary = "게시글 수정", description = "본인이 작성한 게시글의 제목, 본문, 카테고리 등을 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody CommunityDto.PostRequest request,
            @AuthenticationPrincipal Long userId) {
        communityService.updatePost(id, request, userId);
        return ResponseEntity.ok(ApiResponse.successEmpty());
    }

    @Operation(summary = "게시글 삭제", description = "본인 혹은 관리자 권한으로 게시글을 삭제 처리(Soft Delete)합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        communityService.deletePost(id, userId);
        return ResponseEntity.ok(ApiResponse.successEmpty());
    }

    @Operation(summary = "게시글 좋아요 토글", description = "게시글에 좋아요를 누르거나 취소합니다. (작성자 +5점 / 추천인 -1점 연동)")
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<CommunityDto.LikeResponse>> likePost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        CommunityDto.LikeResponse response = communityService.likePost(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "댓글 작성", description = "특정 게시글에 댓글을 작성합니다. (포인트 +30점 지급)")
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Long>> createComment(
            @PathVariable Long id,
            @Valid @RequestBody CommunityDto.CommentRequest request,
            @AuthenticationPrincipal Long userId) {
        Long commentId = communityService.createComment(id, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(commentId));
    }

    @Operation(summary = "댓글 삭제", description = "본인 혹은 관리자 권한으로 댓글을 삭제 처리(Soft Delete)합니다.")
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal Long userId) {
        communityService.deleteComment(commentId, userId);
        return ResponseEntity.ok(ApiResponse.successEmpty());
    }

    @Operation(summary = "댓글 수정", description = "본인이 작성한 댓글의 내용을 수정합니다.")
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommunityDto.CommentRequest request,
            @AuthenticationPrincipal Long userId) {
        communityService.updateComment(commentId, request, userId);
        return ResponseEntity.ok(ApiResponse.successEmpty());
    }
}
