package com.ecovision.app.global.exception;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ecovision.app.global.response.ApiResponse;
import com.ecovision.app.global.response.ErrorResponse;

import lombok.extern.slf4j.Slf4j;

//	전역 예외 처리
//	컨트롤러 단계에서 발생하는 모든 예외를 공통 응답 포맷으로 변환
// 	인증/인가(401/403) 중 시큐리티 필터 단계에서 발생하는 예외는 이 핸들러에 도달하지 못함
//	 -> 이는 SecurityConfig의 AuthenticationEntryPoint/AccessDeniedHandler가 동일한 포맷으로 처리하도록 연결함

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	// 비즈니스 예외(Service에서 의도적으로 throw)
	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e){
		ErrorCode code = e.getErrorCode();
		log.warn("[BusinessException] {} - {}", code.name(), e.getMessage());
		return ResponseEntity.status(code.getStatus())
				.body(ApiResponse.error(code.name(), e.getMessage(), e.getDetails()));
	}
	
	// @Valid @RequestBody 검증 실패 -> 필드별 사유 details에 매핑
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValid(MethodArgumentNotValidException e) {
        List<ErrorResponse.FieldError> details = e.getBindingResult().getFieldErrors().stream()
                .map(this::toFieldError)
                .toList();
        ErrorCode code = ErrorCode.VALIDATION_FAILED;
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.error(code.name(), code.getMessage(), details));
    }
    
    // 그 외 처리되지 않은 모든 예외 -> 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("[UnhandledException]", e);
        ErrorCode code = ErrorCode.INTERNAL_ERROR;
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.error(code.name(), code.getMessage()));
    }
 
    private ErrorResponse.FieldError toFieldError(FieldError fe) {
        return new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage());
    }
 
    // "checkNickname.nickname" 같은 경로에서 마지막 노드(nickname)만 추출
    private String lastNode(String propertyPath) {
        int idx = propertyPath.lastIndexOf('.');
        return idx == -1 ? propertyPath : propertyPath.substring(idx + 1);
    }
}
