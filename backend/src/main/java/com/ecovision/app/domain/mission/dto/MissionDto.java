package com.ecovision.app.domain.mission.dto;

import jakarta.validation.constraints.NotBlank;

//	mission 도메인 요청/응답 DTO 모음 (중첩 record)
public final class MissionDto {

	private MissionDto() {
	}

	// 오늘의 미션 1건 (GET /api/missions/today)
	public record TodayMission(Long assignmentId, Long missionId, String title, String category, String slot,
			int baseReward, double estimatedCo2Kg, boolean completed) {
	}

	// 미션 완료 요청 (POST /api/missions/{assignmentId}/complete)
	public record CompleteRequest(@NotBlank(message = "type은 필수입니다.") String type // DAILY / DUNGEON
	) {
	}

	// 미션 완료 응답 (5.2)
	public record CompleteResponse(Long assignmentId, int baseReward, double carbonWeight, double dungeonMultiplier,
			int finalReward, int cappedReward, boolean dailyLimitReached, double co2ReducedKg, int dailyAccumulated,
			int dailyLimit, DinoResult dino) {
	}

	// 완료에 따른 공룡 상태 변화
	public record DinoResult(int expGained, int totalExp, int affinityGained, String stage, boolean evolved) {
	}
}
