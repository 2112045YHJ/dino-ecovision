package com.ecovision.app.global.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

//	JWT 생성·검증·파싱 (HS256, jjwt 0.12.x API 기준)
//	- Access Token: subject=userId, claim type=access, role=USER/ADMIN
//	- Refresh Token: subject=userId, claim type=refresh (역할 미포함). Redis 저장·검증은 RefreshTokenService

@Component
public class JwtTokenProvider {

	private static final String TYPE_ACCESS = "access";
	private static final String TYPE_REFRESH = "refresh";

	private final SecretKey key;
	private final long accessValidityMs;
	private final long refreshValidityMs;

	public JwtTokenProvider(
			@Value("${jwt.secret}") String secret,
			@Value("${jwt.expiration-ms}") long accessValidityMs,
			@Value("${jwt.refresh-expiration-ms}") long refreshValidityMs) {
		// secret은 최소 32바이트(256bit) 이상이어야 HS256 서명 가능
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessValidityMs = accessValidityMs;
		this.refreshValidityMs = refreshValidityMs;
	}

	public String createAccessToken(Long userId, String role) {
		return build(userId, TYPE_ACCESS, role, accessValidityMs);
	}

	public String createRefreshToken(Long userId) {
		return build(userId, TYPE_REFRESH, null, refreshValidityMs);
	}

	private String build(Long userId, String type, String role, long validityMs) {
		long now = System.currentTimeMillis();
		var builder = Jwts.builder()
				.subject(String.valueOf(userId))
				.claim("type", type)
				.issuedAt(new Date(now))
				.expiration(new Date(now + validityMs))
				.signWith(key, Jwts.SIG.HS256);
		if (role != null) {
			builder.claim("role", role);
		}
		return builder.compact();
	}

	// 서명·만료 검증 후 Claims 반환. 유효하지 않으면 JwtException 계열을 던진다.
	public Claims parseClaims(String token) {
		return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	// 토큰이 유효하고 기대한 타입(access/refresh)인지 boolean으로 반환
	public boolean isValid(String token, boolean accessToken) {
		try {
			Claims c = parseClaims(token);
			String expected = accessToken ? TYPE_ACCESS : TYPE_REFRESH;
			return expected.equals(c.get("type", String.class));
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	public Long getUserId(Claims claims) {
		return Long.valueOf(claims.getSubject());
	}

	public String getRole(Claims claims) {
		return claims.get("role", String.class);
	}

	public long getRefreshValidityMs() {
		return refreshValidityMs;
	}
}
