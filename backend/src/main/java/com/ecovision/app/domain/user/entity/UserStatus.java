package com.ecovision.app.domain.user.entity;

// 계정 상태(관리자가 변경). 로그인 시 ACTIVE가 아니면 ACCOUNT_INACTIVE
public enum UserStatus {
	ACTIVE, INACTIVE, BANNED
}
