package com.ecovision.app.domain.dungeon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.ecovision.app.domain.dungeon.entity.DungeonMissionAssignment;

//	활성 던전 조회(6.1)의 missions 배열 전용 리포지토리(네이티브).
//	요청자 본인에게 배정된, 해당 던전의 미션을 미션 정보·감축계수와 조인해 반환.
//	타입 파라미터는 빈 생성용 더미.
public interface DungeonMissionQueryRepository extends Repository<DungeonMissionAssignment, Long> {

	//	특정 던전 이벤트에 대한 본인 배정 미션 목록.
	//	estimatedCo2Kg: mission_emission_factors.daily_reduction_value (없으면 null → 서비스에서 0).
	//	baseReward: missions.base_reward (던전 배율은 완료 시 적용되므로 여기선 기본값 그대로).
	@Query(value = """
			SELECT dma.id AS assignmentId,
			       m.mission_name AS title,
			       mef.daily_reduction_value AS estimatedCo2Kg,
			       m.base_reward AS baseReward,
			       dma.status AS status
			FROM dungeon_mission_assignments dma
			JOIN missions m ON m.id = dma.mission_id
			LEFT JOIN mission_emission_factors mef ON mef.mission_id = dma.mission_id
			WHERE dma.dungeon_event_id = :dungeonEventId
			  AND dma.user_id = :userId
			ORDER BY dma.id ASC
			""", nativeQuery = true)
	List<DungeonProjections.DungeonMissionRow> findMyDungeonMissions(
			@Param("dungeonEventId") Long dungeonEventId, @Param("userId") Long userId);
}