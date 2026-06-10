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

    @Column(name = "nickname", nullable = false, unique = true, length = 50)
    private String nickname;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "region_id")
    private Long regionId;

    @Column(name = "role", length = 20)
    @Builder.Default
    private String role = "USER";

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "total_points")
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "ranking_point")
    @Builder.Default
    private Integer rankingPoint = 0;

    @Column(name = "today_points_accumulated")
    @Builder.Default
    private Integer todayPointsAccumulated = 0;

    @Column(name = "last_point_accumulated_date")
    private LocalDate lastPointAccumulatedDate;

    @Column(name = "saved_carbon_kg", precision = 12, scale = 3)
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
}
