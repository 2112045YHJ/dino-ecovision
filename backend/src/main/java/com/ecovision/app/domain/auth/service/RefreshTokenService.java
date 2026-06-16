package com.ecovision.app.domain.auth.service;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

//	Refresh Token을 Redis에 저장/조회/삭제 (키: refresh:{userId}, TTL = 만료 기간)
//	- 로그인 시 save, 재발급 시 저장값과 대조, 로그아웃 시 delete(무효화)

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

	private static final String KEY_PREFIX = "refresh:";

	private final StringRedisTemplate redisTemplate;

	public void save(Long userId, String refreshToken, long ttlMs) {
		redisTemplate.opsForValue().set(key(userId), refreshToken, Duration.ofMillis(ttlMs));
	}

	public String find(Long userId) {
		return redisTemplate.opsForValue().get(key(userId));
	}

	public void delete(Long userId) {
		redisTemplate.delete(key(userId));
	}

	private String key(Long userId) {
		return KEY_PREFIX + userId;
	}
}
