package com.ecovision.app.global.security;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.ecovision.app.global.exception.ErrorCode;
import com.ecovision.app.global.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

//	인가 실패(권한 부족)를 공통 응답 포맷의 403 FORBIDDEN으로 응답

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

	private final ObjectMapper objectMapper;

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException {
		ErrorCode code = ErrorCode.FORBIDDEN;
		response.setStatus(code.getStatus().value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		ApiResponse<Void> body = ApiResponse.error(code.name(), code.getMessage());
		response.getWriter().write(objectMapper.writeValueAsString(body));
	}
}
