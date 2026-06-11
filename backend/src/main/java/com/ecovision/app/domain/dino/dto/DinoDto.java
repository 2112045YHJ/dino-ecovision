package com.ecovision.app.domain.dino.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

//	dino 도메인 요청/응답 DTO 모음 (중첩 record)
public final class DinoDto {

	private DinoDto() {}

	// 공룡 부화 요청 (POST /api/me/dino/hatch)
	public record HatchRequest(

			@NotNull(message = "공룡 템플릿 ID는 필수입니다.")
			Long templateId,

			@NotBlank(message = "공룡 이름은 필수입니다.")
			@Size(min = 2, max = 12, message = "공룡 이름은 2~12자여야 합니다.")
			@Pattern(regexp = "^[가-힣A-Za-z0-9]+$", message = "공룡 이름은 한글·영문·숫자만 사용할 수 있습니다.")
			String nickname
	) {}

	// 부화 응답 (201)
	public record HatchResponse(Long dinoId, String nickname, String stage, int exp, int affinity) {}

	// 내 공룡 상태 (GET /api/me/dino). nextStageExp는 ADULT면 null.
	public record DinoStatusResponse(
			Long dinoId, String nickname, String templateName,
			String stage, int exp, Integer nextStageExp, int affinity) {}
}
