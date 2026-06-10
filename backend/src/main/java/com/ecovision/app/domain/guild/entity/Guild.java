package com.ecovision.app.domain.guild.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "guilds")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class Guild {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guild_name", nullable = false, length = 100)
    private String guildName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "region_id", nullable = false, unique = true)
    private Long regionId;

    @Column(name = "leader_user_id")
    private Long leaderUserId;

    @Column(name = "capacity")
    @Builder.Default
    private Integer capacity = 30;

    @Column(name = "total_point")
    @Builder.Default
    private Integer totalPoint = 0;

    @Column(name = "saved_carbon_kg", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal savedCarbonKg = BigDecimal.ZERO;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
