package com.ecovision.app.domain.guild.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ecovision.app.domain.region.entity.Region;

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
    
	private Guild(String guildName, String description, Long regionId) {
		this.guildName = guildName;
		this.description = description;
		this.regionId = regionId;
		this.capacity = 30;
		this.totalPoint = 0;
		this.savedCarbonKg = BigDecimal.ZERO;
	}

	// 지역 정보로 길드 생성 (시드 명명 규칙과 동일)
	public static Guild createForRegion(Region region) {
		String name = region.getSigungu() + " " + region.getDong() + " 에코가드";
		String desc = region.getSido() + " " + region.getSigungu() + " " + region.getDong()
				+ " 주민들의 친환경 탄소감축 길드";
		return new Guild(name, desc, region.getId());
	}
}
