package com.ecovision.app.domain.user.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

//	users 테이블 매핑 (DB 설계서 8.2)
//	닉네임/지역 변경 쿨다운 컬럼 + 온보딩/변경 메서드 추가
//	온보딩 판정은 닉네임/지역/공룡 보유 여부로 판단

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password; // BCrypt 해시 저장

	@Column(unique = true)
	private String nickname; // 온보딩 전 null (NULL 허용)

	@Column(name = "avatar_url")
	private String avatarUrl;

	@Column(name = "region_id")
	private Long regionId; // 온보딩 전 null

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	@Builder.Default
	private Role role = Role.USER;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	@Builder.Default
	private UserStatus status = UserStatus.ACTIVE;

	@Column(name = "total_points", nullable = false)
	@Builder.Default
	private int totalPoints = 0;

	@Column(name = "ranking_point", nullable = false)
	@Builder.Default
	private int rankingPoint = 0;

	@Column(name = "saved_carbon_kg", nullable = false)
	@Builder.Default
	private BigDecimal savedCarbonKg = BigDecimal.ZERO;

	@Column(name = "last_nickname_changed_at")
	private LocalDateTime lastNicknameChangedAt;

	@Column(name = "last_region_changed_at")
	private LocalDateTime lastRegionChangedAt;
	
	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", insertable = false, updatable = false)
	private LocalDateTime updatedAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	// ===== 온보딩 미완료 판정 =====
	
	// 닉네임, 지역이 모두 설정됐는지
	public boolean isOnboarded() {
		return nickname != null && regionId != null;
	}
	
	// 온보인 미완료 여부
	// 명세상 닉네임 + 지역 + 공룡 보유까지 필요
	// 공룡 보유 여부(hasDino)는 dino 도메인 조회 결과를 서비스에서 주입
	public boolean isOnboardingRequired(boolean hasDino) {
		return nickname == null || regionId == null || !hasDino;
	}

	public boolean isActive() {
		return status == UserStatus.ACTIVE && deletedAt == null;
	}
	
	// ===== 변경 동작 =====
	
	// 온보딩 등록
	// 닉네임, 지역 설정 + 쿨다운 기준 시점 시작
	public void completeOnboarding(String nickname, Long regionId, LocalDateTime now) {
		this.nickname = nickname;
		this.regionId = regionId;
		this.lastNicknameChangedAt = now;
		this.lastRegionChangedAt = now;
	}
	
	public void changeNickname(String nickname, LocalDateTime now) {
		this.nickname = nickname;
		this.lastNicknameChangedAt = now;
	}
	
	public void changeRegion(Long regionId, LocalDateTime now) {
		this.regionId = regionId;
		this.lastRegionChangedAt = now;
	}
}
