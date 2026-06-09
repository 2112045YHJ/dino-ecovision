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
//	users 테이블은 auth/user 두 도메인이 공유하므로 엔티티 소유는 user 도메인에 둔다.
//	2단계에서 인증에 필요한 컬럼 위주로 매핑. 미매핑 컬럼(today_points_accumulated 등)은
//	ddl-auto=validate에서 문제되지 않으며, 각 도메인 개발 시 이 엔티티에 추가한다.

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
	private Long regionId; // 온보딩 전 null. regions FK — 추후 @ManyToOne Region으로 확장 가능

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

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", insertable = false, updatable = false)
	private LocalDateTime updatedAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	// 온보딩 미완료 판정.
	// 2단계 시점에는 닉네임·지역만으로 판정한다. 공룡 보유 여부는 dino 도메인(3단계) 추가 후
	// 이 메서드에서 함께 검사하도록 확장한다(명세상 온보딩 = 닉네임·지역·공룡).
	public boolean isOnboardingRequired() {
		return nickname == null || regionId == null;
	}

	public boolean isActive() {
		return status == UserStatus.ACTIVE && deletedAt == null;
	}
}
