package com.ecovision.app.global.response;

import java.util.List;

import org.springframework.validation.FieldError;

// 공통 에러 객체 { code, message, details }
// - code: ErrorCode명 문자열 (예: "VALIDATION_FAILED")
// - message: 사용자에게 보여줄 메시지
// - detail: @Valid 검증 실패 시 필드별 사유 배열. 없으면 빈 배열로 나옴

public record ErrorResponse(String code, String message, List<FieldError> details) {

//	필드 단위 검증 실패 사유
	public record FieldError(String field, String message) {}
}
