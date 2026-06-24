package com.ecovision.app.domain.dungeon.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

//	dungeon 도메인 응답 DTO. (6.1 활성 던전 조회)
//	활성 던전이 없으면 컨트롤러가 data=null 로 반환하므로, 이 DTO는 "있을 때"만 사용.
public final class DungeonDto {

	private DungeonDto() {
	}

	//	활성 던전 정보(공통) + 요청자 본인에게 배정된 던전 미션 목록.
	public record ActiveDungeonResponse(
			Long dungeonId,
			String status,
			BigDecimal reserveRate,
			BigDecimal dungeonMultiplier,
			LocalDateTime startedAt,
			LocalDateTime endsAt,
			long remainingSeconds,
			List<DungeonMission> missions) {
	}

	//	던전 미션 항목. assignmentId 는 본인 배정 ID(완료 시 type=DUNGEON 으로 사용).
	//	completed: 본인 배정 상태가 COMPLETED 인지(오늘의 미션 화면에서 완료 표시용).
	public record DungeonMission(
			Long assignmentId,
			String title,
			BigDecimal estimatedCo2Kg,
			int baseReward,
			boolean completed) {
	}
}