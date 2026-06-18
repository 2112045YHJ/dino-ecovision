package com.ecovision.app.domain.dungeon.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.dungeon.dto.DungeonDto;
import com.ecovision.app.domain.dungeon.entity.DungeonEvent;
import com.ecovision.app.domain.dungeon.repository.DungeonEventRepository;
import com.ecovision.app.domain.dungeon.repository.DungeonMissionQueryRepository;
import com.ecovision.app.domain.dungeon.repository.DungeonProjections;

import lombok.RequiredArgsConstructor;

//	활성 던전 조회(6.1). 발령·종료는 DungeonScheduler 가 담당하므로 여기서는 읽기만.
@Service
@RequiredArgsConstructor
public class DungeonQueryService {

	private static final String STATUS_ACTIVE = "ACTIVE";

	private final DungeonEventRepository dungeonEventRepository;
	private final DungeonMissionQueryRepository dungeonMissionQueryRepository;

	//	활성 던전이 없으면 null. 있으면 던전 정보 + 본인 배정 던전 미션 목록.
	@Transactional(readOnly = true)
	public DungeonDto.ActiveDungeonResponse getActiveDungeon(Long userId) {
		Optional<DungeonEvent> activeOpt =
				dungeonEventRepository.findFirstByStatusOrderByStartedAtDesc(STATUS_ACTIVE);
		if (activeOpt.isEmpty()) {
			return null; // 컨트롤러가 data=null 로 응답
		}
		DungeonEvent dungeon = activeOpt.get();

		// 종료까지 남은 시간(초). ended_at(종료 예정) - now. 음수면 0.
		long remainingSeconds = 0L;
		if (dungeon.getEndedAt() != null) {
			long secs = Duration.between(LocalDateTime.now(), dungeon.getEndedAt()).getSeconds();
			remainingSeconds = Math.max(0L, secs);
		}

		// 본인에게 배정된 던전 미션 목록
		List<DungeonProjections.DungeonMissionRow> rows =
				dungeonMissionQueryRepository.findMyDungeonMissions(dungeon.getId(), userId);
		List<DungeonDto.DungeonMission> missions = new ArrayList<>(rows.size());
		for (DungeonProjections.DungeonMissionRow row : rows) {
			missions.add(new DungeonDto.DungeonMission(
					row.getAssignmentId(),
					row.getTitle(),
					row.getEstimatedCo2Kg() != null ? row.getEstimatedCo2Kg() : BigDecimal.ZERO,
					row.getBaseReward() != null ? row.getBaseReward() : 0));
		}

		return new DungeonDto.ActiveDungeonResponse(
				dungeon.getId(),
				dungeon.getStatus(),
				dungeon.getReserveRate(),
				dungeon.getRewardMultiplier(),
				dungeon.getStartedAt(),
				dungeon.getEndedAt(),
				remainingSeconds,
				missions);
	}
}