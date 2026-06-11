package com.ecovision.app.domain.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.auth.dto.AuthDto;
import com.ecovision.app.domain.dino.repository.UserDinoRepository;
import com.ecovision.app.domain.user.entity.Role;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.entity.UserStatus;
import com.ecovision.app.domain.user.repository.UserRepository;
import com.ecovision.app.global.exception.BusinessException;
import com.ecovision.app.global.exception.ErrorCode;
import com.ecovision.app.global.security.JwtTokenProvider;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

//	인증 비즈니스 로직: 회원가입 / 로그인 / 로그아웃 / 토큰 재발급
//	트랜잭션 경계는 Service. HTTP/쿠키 처리는 Controller가 담당.

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenProvider tokenProvider;
	private final RefreshTokenService refreshTokenService;
	private final UserDinoRepository userDinoRepository;

	// 회원가입: 이메일 중복 검사 → 비밀번호 해시 → 저장. 닉네임·지역은 온보딩(3단계)에서 설정.
	@Transactional
	public AuthDto.SignupResponse signup(AuthDto.SignupRequest request) {
		if (userRepository.existsByEmail(request.email())) {
			throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
		}
		User user = User.builder()
				.email(request.email())
				.password(passwordEncoder.encode(request.password()))
				.role(Role.USER)
				.status(UserStatus.ACTIVE)
				.build();
		User saved = userRepository.save(user);
		return new AuthDto.SignupResponse(saved.getId(), saved.getEmail(), true);
	}

	// 로그인: 이메일 조회 → 비밀번호 대조 → 계정 상태 확인 → Access/Refresh 발급 + Refresh를 Redis 저장.
	// 보안상 "이메일 없음"과 "비밀번호 불일치"를 LOGIN_FAILED로 동일하게 처리(사유 미구분).
	@Transactional(readOnly = true)
	public AuthDto.LoginResult login(AuthDto.LoginRequest request) {
		User user = userRepository.findByEmail(request.email())
				.orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_FAILED));

		if (user.getDeletedAt() != null || !passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new BusinessException(ErrorCode.LOGIN_FAILED);
		}
		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
		}

		String accessToken = tokenProvider.createAccessToken(user.getId(), user.getRole().name());
		String refreshToken = tokenProvider.createRefreshToken(user.getId());
		refreshTokenService.save(user.getId(), refreshToken, tokenProvider.getRefreshValidityMs());

		boolean hasDino = userDinoRepository.existsByUserId(user.getId());
		AuthDto.LoginResponse body = new AuthDto.LoginResponse(
				accessToken, user.isOnboardingRequired(hasDino), user.getRole().name());
		return new AuthDto.LoginResult(body, refreshToken);
	}

	// 로그아웃: Redis의 Refresh Token 삭제(무효화). 쿠키 만료는 Controller가 처리.
	public void logout(Long userId) {
		refreshTokenService.delete(userId);
	}

	// 토큰 재발급: 쿠키의 Refresh Token 검증 → Redis 저장값과 대조 → 새 Access 발급.
	// MVP에서는 Refresh 회전 없이 Access만 재발급한다.
	@Transactional(readOnly = true)
	public AuthDto.TokenRefreshResponse refresh(String refreshToken) {
		if (refreshToken == null || !tokenProvider.isValid(refreshToken, false)) {
			throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
		}
		Claims claims = tokenProvider.parseClaims(refreshToken);
		Long userId = tokenProvider.getUserId(claims);

		String stored = refreshTokenService.find(userId);
		if (stored == null || !stored.equals(refreshToken)) {
			throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN); // 로그아웃됨·만료·위조
		}

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));
		if (!user.isActive()) {
			throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
		}

		String newAccessToken = tokenProvider.createAccessToken(userId, user.getRole().name());
		return new AuthDto.TokenRefreshResponse(newAccessToken);
	}
}
