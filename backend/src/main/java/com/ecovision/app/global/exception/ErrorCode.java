package com.ecovision.app.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

//	error 코드 정의
//	response의 error.code에 사용됨
//	공통 코드를 먼저 정의하고 도메인별 고유 코드는 각 도메인을 개발할 때 아래 도메인별 코드 영역에 한 줄씩 추가

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
	
	// 공통 에러 코드
	VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),
	UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
	FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
	NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다."),
	CONFLICT(HttpStatus.CONFLICT, "요청이 현재 상태와 충돌합니다."),
	INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
	
	// 도메인별 코드 (개발하며 추가)
	// 예: DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.")
	
	// auth 도메인 코드
	DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 가입된 이메일입니다."),
	LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."),
	ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, "비활성화되거나 제재된 계정입니다."),
	INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "세션이 만료되었습니다. 다시 로그인해 주세요.");
	
	private final HttpStatus status;
	private final String message;
}
