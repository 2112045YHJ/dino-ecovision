package com.ecovision.app.global.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

//	모든 API 공통 응답 포맷: { success, data, error }
//	성공 시 error = null, 실패 시 data = null
//	직접 new 하지 않고 정적 팩토리(success/error)로만 생성

@JsonInclude(JsonInclude.Include.ALWAYS) // data:null, error:null 도 응답에 그대로 노출
public record ApiResponse<T>(boolean success, T data, ErrorResponse error) {
	
	// 데이터가 있는 성공 응답
	public static <T> ApiResponse<T> success(T data) {
		return new ApiResponse<T>(true, data, null);
	}
	
	
	// 데이터가 없는 성공 응답 (204 등)
	public static ApiResponse<Void> successEmpty() {
		return new ApiResponse<Void>(true, null, null);
	}
	
	// 필드 사유가 없는 실패 응답
	public static ApiResponse<Void> error(String code, String message) {
		return error(code, message, List.of());
	}
	
	// 필드별 검증 사유(details)를 포함하는 실패 응답
	public static ApiResponse<Void> error(String code, String message, List<ErrorResponse.FieldError> details) {
		return new ApiResponse<>(false, null, new ErrorResponse(code, message, details));
	}
	
}
