package com.ecovision.app.domain.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

//	admin 도메인 DTO. (13.2 던전 수동 발령 / 13.3 회원 상태 변경)
//	13.2 응답은 던전 6.1과 동일 구조(DungeonDto.ActiveDungeonResponse)를 재사용한다.
public final class AdminDto {

	private AdminDto() {
	}

	// ===== 13.2 던전 수동 발령 =====

	//	가짜 예비율로 던전 강제 발령. durationMinutes 미지정 시 60분.
	public record ManualDungeonRequest(
			@NotNull Double reserveRate,
			@Positive Integer durationMinutes) {
	}

	// ===== 13.3 회원 상태 변경 =====

	//	status: ACTIVE / INACTIVE / BANNED. reason 은 로그용.
	public record UserStatusRequest(
			@NotBlank String status,
			String reason) {
	}

	public record UserStatusResponse(
			Long userId,
			String status) {
	}
}