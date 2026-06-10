package com.ecovision.app.domain.user.entity;

// 사용자 권한. JWT claims의 role, Spring Security 권한(ROLE_USER/ROLE_ADMIN)에 사용
public enum Role {
	USER, ADMIN
}
