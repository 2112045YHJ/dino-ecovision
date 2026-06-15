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
	INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "세션이 만료되었습니다. 다시 로그인해 주세요."),
	
	// user 도메인 코드
	DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
	INVALID_REGION_CODE(HttpStatus.BAD_REQUEST, "표준 코드 목록에 없는 지역입니다."),
	ALREADY_ONBOARDED(HttpStatus.CONFLICT, "이미 온보딩을 완료했습니다."),
	CHANGE_COOLDOWN(HttpStatus.TOO_MANY_REQUESTS, "변경 쿨다운이 경과하지 않았습니다."),
	
	// dino 도메인 코드
	DINO_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 공룡을 보유하고 있습니다."),
	INVALID_TEMPLATE(HttpStatus.BAD_REQUEST, "존재하지 않는 공룡 템플릿입니다."),
	DINO_NOT_FOUND(HttpStatus.NOT_FOUND, "보유한 공룡이 없습니다."),
	
	// mission 도메인 코드
	ASSIGNMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "본인에게 배정되지 않은 미션입니다."),
	ALREADY_COMPLETED(HttpStatus.CONFLICT, "이미 완료한 미션입니다."),
	MISSION_EXPIRED(HttpStatus.BAD_REQUEST, "만료된 미션입니다."),
	
	// quiz 도메인 코드
	ALREADY_ATTEMPTED(HttpStatus.CONFLICT, "오늘의 퀴즈는 이미 참여하셨습니다."),
	QUIZ_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 퀴즈입니다.");
	
	private final HttpStatus status;
	private final String message;
}
