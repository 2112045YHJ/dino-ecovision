package com.ecovision.app.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString(exclude = "password")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "nickname", unique = true, length = 50)
    private String nickname;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "region_id")
    private Long regionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "ranking_point", nullable = false)
    @Builder.Default
    private Integer rankingPoint = 0;

    @Column(name = "today_points_accumulated", nullable = false)
    @Builder.Default
    private Integer todayPointsAccumulated = 0;

    @Column(name = "last_point_accumulated_date")
    private LocalDate lastPointAccumulatedDate;

    @Column(name = "saved_carbon_kg", nullable = false, precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal savedCarbonKg = BigDecimal.ZERO;

    @Column(name = "last_region_changed_at")
    private LocalDateTime lastRegionChangedAt;

    @Column(name = "last_nickname_changed_at")
    private LocalDateTime lastNicknameChangedAt;

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

    // 온보딩 미완료 여부 (dino 정보가 없는 로그인 단계 등에서 사용)
    public boolean isOnboardingRequired() {
        return nickname == null || regionId == null;
    }

    // 온보딩 미완료 여부
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
