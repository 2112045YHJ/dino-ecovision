package com.ecovision.app.domain.mission.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_mission_results")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class UserMissionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "mission_id", nullable = false)
    private Long missionId;

    @Column(name = "assignment_type", nullable = false, length = 30)
    private String assignmentType;

    @Column(name = "daily_assignment_id")
    private Long dailyAssignmentId;

    @Column(name = "dungeon_assignment_id")
    private Long dungeonAssignmentId;

    @Column(name = "carbon_intensity_log_id")
    private Long carbonIntensityLogId;

    @Column(name = "completed_at", insertable = false, updatable = false)
    private LocalDateTime completedAt;

    @Column(name = "base_reward", nullable = false)
    private Integer baseReward;

    @Column(name = "carbon_weight", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal carbonWeight = BigDecimal.ONE;

    @Column(name = "dungeon_multiplier", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal dungeonMultiplier = BigDecimal.ONE;

    @Column(name = "calculated_reward", nullable = false)
    private Integer calculatedReward;

    @Column(name = "earned_point", nullable = false)
    private Integer earnedPoint;

    @Column(name = "daily_limit_applied")
    @Builder.Default
    private Boolean dailyLimitApplied = false;

    @Column(name = "ranking_point", nullable = false)
    private Integer rankingPoint;

    @Column(name = "clean_energy_amount")
    @Builder.Default
    private Integer cleanEnergyAmount = 0;

    @Column(name = "estimated_reduction_kg", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal estimatedReductionKg = BigDecimal.ZERO;

    @Column(name = "proof_type", length = 30)
    @Builder.Default
    private String proofType = "SELF_REPORT";

    @Column(name = "proof_url", length = 255)
    private String proofUrl;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "COMPLETED";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
