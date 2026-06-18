package com.ecovision.app.domain.dungeon.repository;

import java.math.BigDecimal;

//	던전 미션 조회 네이티브 쿼리 결과 매핑용 projection.
public final class DungeonProjections {

	private DungeonProjections() {
	}

	//	던전 미션 한 줄. estimatedCo2Kg 는 mission_emission_factors.daily_reduction_value (없으면 null → 0).
	public interface DungeonMissionRow {
		Long getAssignmentId();
		String getTitle();
		BigDecimal getEstimatedCo2Kg();
		Integer getBaseReward();
	}
}