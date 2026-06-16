package com.ecovision.app.domain.mission.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "missions")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mission_code", nullable = false, unique = true, length = 80)
    private String missionCode;

    @Column(name = "mission_name", nullable = false, length = 150)
    private String missionName;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "slot_type", length = 30)
    @Builder.Default
    private String slotType = "ANYTIME";

    @Column(name = "mission_type", length = 30)
    @Builder.Default
    private String missionType = "DAILY";

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "base_reward", nullable = false)
    @Builder.Default
    private Integer baseReward = 20;

    @Column(name = "proof_type", length = 30)
    @Builder.Default
    private String proofType = "SELF_REPORT";

    @Column(name = "proof_guide_text", length = 200)
    @Builder.Default
    private String proofGuideText = "자가 신고 미션입니다. 정직하게 체크해주세요.";

    @Column(name = "is_repeatable")
    @Builder.Default
    private Boolean isRepeatable = true;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
