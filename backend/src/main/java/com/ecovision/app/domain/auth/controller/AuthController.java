package com.ecovision.app.domain.auth.controller;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.auth.dto.AuthDto;
import com.ecovision.app.domain.auth.service.AuthService;
import com.ecovision.app.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//	auth API: 회원가입 / 로그인 / 로그아웃 / 토큰 재발급
//	Refresh Token은 응답 바디가 아니라 httpOnly·Secure 쿠키로 주고받는다.

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private static final String REFRESH_COOKIE = "refreshToken";

	private final AuthService authService;

	@Value("${jwt.refresh-expiration-ms}")
	private long refreshValidityMs;

	// 로컬(http) 개발 시 쿠키가 안 붙으면 app.cookie.secure=false, app.cookie.same-site=Lax 로 조정
	@Value("${app.cookie.secure:true}")
	private boolean cookieSecure;

	@Value("${app.cookie.same-site:None}")
	private String cookieSameSite;

	@PostMapping("/signup")
	public ResponseEntity<ApiResponse<AuthDto.SignupResponse>> signup(@Valid @RequestBody AuthDto.SignupRequest request) {
		AuthDto.SignupResponse data = authService.signup(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(data));
	}

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<AuthDto.LoginResponse>> login(@Valid @RequestBody AuthDto.LoginRequest request) {
		AuthDto.LoginResult result = authService.login(request);
		ResponseCookie cookie = buildRefreshCookie(result.refreshToken(), refreshValidityMs / 1000);
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, cookie.toString())
				.body(ApiResponse.success(result.body()));
	}

	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal Long userId) {
		authService.logout(userId);
		ResponseCookie expired = buildRefreshCookie("", 0); // Max-Age=0 → 쿠키 만료
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, expired.toString())
				.body(ApiResponse.successEmpty());
	}

	@PostMapping("/refresh")
	public ResponseEntity<ApiResponse<AuthDto.TokenRefreshResponse>> refresh(
			@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
		AuthDto.TokenRefreshResponse data = authService.refresh(refreshToken);
		return ResponseEntity.ok(ApiResponse.success(data));
	}

	private ResponseCookie buildRefreshCookie(String value, long maxAgeSeconds) {
		return ResponseCookie.from(REFRESH_COOKIE, value)
				.httpOnly(true)
				.secure(cookieSecure)
				.sameSite(cookieSameSite)
				.path("/")
				.maxAge(Duration.ofSeconds(maxAgeSeconds))
				.build();
	}
}
