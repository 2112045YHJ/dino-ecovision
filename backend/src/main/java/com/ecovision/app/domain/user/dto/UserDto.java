package com.ecovision.app.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

//	user 도메인 요청/응답 DTO 모음 (중첩 record)

public final class UserDto {
	
	private UserDto() {}
	
	// 내 프로필 (GET /api/me, 온보딩/변경 응답 공통)
	public record ProfileResponse(
			Long userId, String email, String nickname, String regionCode, String regionName,
			int totalPoints, int rankingPoint, double savedCarbonKg, String role, boolean onboardingRequired) {}

	// 닉네임 중복 확인 (GET /api/me/nickname/check)
	public record NicknameCheckResponse(boolean available) {}
	
	// 온보딩 등록 (POST /api/me/onboarding)
	public record OnboardingRequest(
			@NotBlank(message = "닉네임은 필수입니다.")
			@Size(min = 2, max = 12, message = "닉네임은 2~12자여야 합니다.")
			@Pattern(regexp = "^[가-힣A-Za-z0-9]+$", message = "닉네임은 한글·영문·숫자만 사용할 수 있습니다.")
			String nickname,
			
			@NotBlank(message = "지역 코드는 필수입니다.")
			String regionCode
			
			) {}
	
	// 닉네임 변경 (PATCH /api/me/nickname)
	public record NicknameChangeRequest(
			@NotBlank(message = "닉네임은 필수입니다.")
			@Size(min = 2, max = 12, message = "닉네임은 2~12자여야 합니다.")
			@Pattern(regexp = "^[가-힣A-Za-z0-9]+$", message = "닉네임은 한글·영문·숫자만 사용할 수 있습니다.")
			String nickname
			) {}
	
	// 온보딩 변경 (PATCH /api/me/onboarding)
	public record RegionChangeRequest(
			@NotBlank(message = "지역 코드는 필수입니다.")
			String regionCode
			) {}

	// 포인트 이력 응답 (GET /api/me/points)
	public record PointHistoryResponse(
			Long id,
			String reason,
			int amount,
			LocalDateTime createdAt
	) {}
}
