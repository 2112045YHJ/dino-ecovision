package com.ecovision.app.domain.user.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.user.dto.UserDto;
import com.ecovision.app.domain.user.service.UserService;
import com.ecovision.app.global.response.ApiResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

//	user API: 프로필 / 닉네임 중복확인 / 온보딩 / 닉네임·지역 변경 (모두 인증 필요)
//	@Validated: 닉네임 중복확인의 @RequestParam 검증 → ConstraintViolationException → 전역 핸들러가 400 처리
@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
@Validated
public class UserController {

	private final UserService userService;

	@GetMapping
	public ApiResponse<UserDto.ProfileResponse> getMyProfile(@AuthenticationPrincipal Long userId) {
		return ApiResponse.success(userService.getMyProfile(userId));
	}

	@GetMapping("/nickname/check")
	public ApiResponse<UserDto.NicknameCheckResponse> checkNickname(
			@RequestParam("nickname")
			@NotBlank(message = "닉네임은 필수입니다.")
			@Size(min = 2, max = 12, message = "닉네임은 2~12자여야 합니다.")
			@Pattern(regexp = "^[가-힣A-Za-z0-9]+$", message = "닉네임은 한글·영문·숫자만 사용할 수 있습니다.")
			String nickname) {
		return ApiResponse.success(userService.checkNickname(nickname));
	}

	@PostMapping("/onboarding")
	public ApiResponse<UserDto.ProfileResponse> onboarding(
			@AuthenticationPrincipal Long userId,
			@Valid @RequestBody UserDto.OnboardingRequest request) {
		return ApiResponse.success(userService.onboarding(userId, request));
	}

	@PatchMapping("/nickname")
	public ApiResponse<UserDto.ProfileResponse> changeNickname(
			@AuthenticationPrincipal Long userId,
			@Valid @RequestBody UserDto.NicknameChangeRequest request) {
		return ApiResponse.success(userService.changeNickname(userId, request));
	}

	@PatchMapping("/region")
	public ApiResponse<UserDto.ProfileResponse> changeRegion(
			@AuthenticationPrincipal Long userId,
			@Valid @RequestBody UserDto.RegionChangeRequest request) {
		return ApiResponse.success(userService.changeRegion(userId, request));
	}
}
