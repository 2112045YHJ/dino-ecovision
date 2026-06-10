package com.ecovision.app.domain.ranking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_ranking_scores")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class UserRankingScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "season_id", nullable = false)
    private Long seasonId;

    @Column(name = "region_id")
    private Long regionId;

    @Column(name = "ranking_point")
    @Builder.Default
    private Integer rankingPoint = 0;

    @Column(name = "completed_mission_count")
    @Builder.Default
    private Integer completedMissionCount = 0;

    @Column(name = "estimated_reduction_kg", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal estimatedReductionKg = BigDecimal.ZERO;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
