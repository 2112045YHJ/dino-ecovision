package com.ecovision.app.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

//	auth 도메인 요청/응답 DTO 모음.
//	도메인 단위로 한 파일에 묶고 중첩 record로 용도를 구분한다.
//	사용처에서는 AuthDto.LoginRequest 처럼 참조한다.

public final class AuthDto {

	private AuthDto() {} // 인스턴스화 방지 — 네임스페이스 용도

	// ===== 회원가입 =====
	public record SignupRequest(

			@NotBlank(message = "이메일은 필수입니다.")
			@Email(message = "올바른 이메일 형식이 아닙니다.")
			String email,

			@NotBlank(message = "비밀번호는 필수입니다.")
			@Size(min = 8, max = 64, message = "비밀번호는 8~64자여야 합니다.")
			@Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "비밀번호는 영문과 숫자를 모두 포함해야 합니다.")
			String password
	) {}

	public record SignupResponse(Long userId, String email, boolean onboardingRequired) {}

	// ===== 로그인 =====
	public record LoginRequest(

			@NotBlank(message = "이메일은 필수입니다.")
			@Email(message = "올바른 이메일 형식이 아닙니다.")
			String email,

			@NotBlank(message = "비밀번호는 필수입니다.")
			String password
	) {}

	public record LoginResponse(String accessToken, boolean onboardingRequired, String role) {}

	// 서비스 → 컨트롤러 내부 전달용(외부 노출 X).
	// body는 응답 바디, refreshToken은 컨트롤러가 httpOnly 쿠키로 세팅한다.
	public record LoginResult(LoginResponse body, String refreshToken) {}

	// ===== 토큰 재발급 =====
	public record TokenRefreshResponse(String accessToken) {}
}
