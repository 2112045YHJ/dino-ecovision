package com.ecovision.app.domain.user.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.user.dto.UserDto;
import com.ecovision.app.domain.user.service.UserService;
import com.ecovision.app.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserPublicController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ApiResponse<UserDto.ProfileResponse> getUserProfile(@PathVariable("userId") Long userId) {
        return ApiResponse.success(userService.getMyProfile(userId));
    }

    @GetMapping("/{userId}/points")
    public ApiResponse<List<UserDto.PointHistoryResponse>> getUserPointTimeline(@PathVariable("userId") Long userId) {
        return ApiResponse.success(userService.getPointTimeline(userId));
    }
}
