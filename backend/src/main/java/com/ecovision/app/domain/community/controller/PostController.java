package com.ecovision.app.domain.community.controller;

import com.ecovision.app.domain.community.dto.CommunityDto;
import com.ecovision.app.domain.community.service.CommunityService;
import com.ecovision.app.global.response.ApiResponse;
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

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final CommunityService communityService;

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createPost(
            @Valid @RequestBody CommunityDto.PostRequest request,
            @AuthenticationPrincipal Long userId) {
        Long postId = communityService.createPost(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(postId));
    }

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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityDto.PostResponse>> getPostDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        CommunityDto.PostResponse details = communityService.getPostDetails(id, userId);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody CommunityDto.PostRequest request,
            @AuthenticationPrincipal Long userId) {
        communityService.updatePost(id, request, userId);
        return ResponseEntity.ok(ApiResponse.successEmpty());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        communityService.deletePost(id, userId);
        return ResponseEntity.ok(ApiResponse.successEmpty());
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<CommunityDto.LikeResponse>> likePost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        CommunityDto.LikeResponse response = communityService.likePost(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Long>> createComment(
            @PathVariable Long id,
            @Valid @RequestBody CommunityDto.CommentRequest request,
            @AuthenticationPrincipal Long userId) {
        Long commentId = communityService.createComment(id, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(commentId));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal Long userId) {
        communityService.deleteComment(commentId, userId);
        return ResponseEntity.ok(ApiResponse.successEmpty());
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommunityDto.CommentRequest request,
            @AuthenticationPrincipal Long userId) {
        communityService.updateComment(commentId, request, userId);
        return ResponseEntity.ok(ApiResponse.successEmpty());
    }
}
