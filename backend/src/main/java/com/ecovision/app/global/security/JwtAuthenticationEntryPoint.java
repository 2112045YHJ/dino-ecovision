package com.ecovision.app.global.security;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.ecovision.app.global.exception.ErrorCode;
import com.ecovision.app.global.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

//	인증 실패(토큰 없음·만료·위조)를 공통 응답 포맷의 401 UNAUTHORIZED로 응답
//	필터 단계에서 발생하므로 @RestControllerAdvice가 아닌 여기서 처리

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ObjectMapper objectMapper;

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException {
		ErrorCode code = ErrorCode.UNAUTHORIZED;
		response.setStatus(code.getStatus().value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		ApiResponse<Void> body = ApiResponse.error(code.name(), code.getMessage());
		response.getWriter().write(objectMapper.writeValueAsString(body));
	}
}
