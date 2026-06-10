package com.ecovision.app.global.exception;

import java.util.List;

import com.ecovision.app.global.response.ErrorResponse;

import lombok.Getter;

//	비즈니스 로직에서 의도적으로 던지는 예외
//	Service 계층에서 사용됨 (throw new BuisnessException(ErrorCode.DUPLICATE_EMAIL);)
//	GlobalExceptionHandler가 errorCode.status/mesage/details 를 읽어 공통 응답 포맷으로 변환

@Getter
public class BusinessException extends RuntimeException{

	private final ErrorCode errorCode;
	private final List<ErrorResponse.FieldError> details;
	
	public BusinessException(ErrorCode errorCode) {
		super(errorCode.getMessage());
		this.errorCode = errorCode;
		this.details = List.of();
	}
	
	// 기본 메시지 대신 커스텀 메시지 쓰고 싶을 때
    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.details = List.of();
    }
	
	// 필드별 사유 함께 부여하고 싶을 때 (쿨다운 다음 변경 가능일 등등)
	public BusinessException(ErrorCode errorCode, List<ErrorResponse.FieldError> details) {
		super(errorCode.getMessage());
		this.errorCode = errorCode;
		this.details = details;
	}
}
