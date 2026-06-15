package com.ecovision.app.domain.mission.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

// mission_emission_factors 매핑 (읽기 전용 시드). 완료 시 일일 감축량 출처.
// MVP 활성 미션은 annual_fixed라 daily_reduction_value를 그대로 읽어 쓴다.
@Entity
@Table(name = "mission_emission_factors")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MissionEmissionFactor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "mission_id")
	private Long missionId;

	@Column(name = "mission_code", nullable = false)
	private String missionCode;

	@Column(name = "calculation_type", nullable = false)
	private String calculationType;

	@Column(name = "daily_reduction_value", precision = 12, scale = 6)
	private BigDecimal dailyReductionValue;

	@Column(name = "weekly_reduction_value", precision = 12, scale = 6)
	private BigDecimal weeklyReductionValue;

	@Column(name = "apply_status")
	private String applyStatus;
}
