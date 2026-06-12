package com.ecovision.app.domain.user.controller;

import com.ecovision.app.domain.user.dto.UserDto;
import com.ecovision.app.domain.user.service.UserService;
import com.ecovision.app.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserDto.ProfileResponse>> getProfile(@AuthenticationPrincipal Long userId) {
        UserDto.ProfileResponse profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/nickname/check")
    public ResponseEntity<ApiResponse<UserDto.NicknameCheckResponse>> checkNickname(
            @RequestParam String nickname) {
        UserDto.NicknameCheckResponse response = userService.checkNicknameAvailable(nickname);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<ApiResponse<UserDto.ProfileResponse>> completeOnboarding(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UserDto.OnboardingRequest request) {
        UserDto.ProfileResponse profile = userService.completeOnboarding(userId, request);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/points")
    public ResponseEntity<ApiResponse<List<UserDto.PointHistoryResponse>>> getPointTimeline(
            @AuthenticationPrincipal Long userId) {
        List<UserDto.PointHistoryResponse> timeline = userService.getPointTimeline(userId);
        return ResponseEntity.ok(ApiResponse.success(timeline));
    }

    @GetMapping("/comments")
    public ResponseEntity<ApiResponse<List<com.ecovision.app.domain.user.dto.MypageCommentsResponse>>> getMyComments(
            @AuthenticationPrincipal Long userId) {
        List<com.ecovision.app.domain.user.dto.MypageCommentsResponse> comments = userService.getMyComments(userId);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }
}
