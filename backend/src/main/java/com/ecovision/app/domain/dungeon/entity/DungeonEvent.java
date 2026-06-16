package com.ecovision.app.domain.dungeon.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dungeon_events")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class DungeonEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "trigger_type", nullable = false, length = 30)
    private String triggerType;

    @Column(name = "reserve_rate", precision = 6, scale = 2)
    private BigDecimal reserveRate;

    @Column(name = "carbon_intensity", precision = 10, scale = 3)
    private BigDecimal carbonIntensity;

    @Column(name = "reward_multiplier", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal rewardMultiplier = new BigDecimal("2.00");

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
