package com.ecovision.app.domain.dungeon.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.ecovision.app.domain.dungeon.entity.DungeonMissionAssignment;

//	던전 미션 배정(발령 시 일괄 발급)에 필요한 조회 전용 리포지토리(네이티브).
//	실제 일괄 INSERT 는 JdbcTemplate(배치)으로 처리하고, 여기서는 대상/풀/중복 조회만 담당.
public interface DungeonAssignmentQueryRepository extends Repository<DungeonMissionAssignment, Long> {

	//	활성 던전 미션 풀(mission_type='DUNGEON', is_active=TRUE) ID 목록. 결정론적 선택 위해 id 정렬.
	@Query(value = """
			SELECT m.id
			FROM missions m
			WHERE m.mission_type = 'DUNGEON' AND m.is_active = TRUE
			ORDER BY m.id ASC
			""", nativeQuery = true)
	List<Long> findActiveDungeonMissionIds();

	//	배정 대상 사용자: 정상 계정(status='ACTIVE') + 공룡 보유(user_dinos 존재).
	@Query(value = """
			SELECT u.id
			FROM users u
			WHERE u.status = 'ACTIVE'
			  AND u.deleted_at IS NULL
			  AND EXISTS (SELECT 1 FROM user_dinos d WHERE d.user_id = u.id)
			""", nativeQuery = true)
	List<Long> findAssignmentTargetUserIds();

	//	이미 이 던전에 배정된 사용자 ID(재실행 시 제외용).
	@Query(value = """
			SELECT DISTINCT dma.user_id
			FROM dungeon_mission_assignments dma
			WHERE dma.dungeon_event_id = :dungeonEventId
			""", nativeQuery = true)
	List<Long> findAlreadyAssignedUserIds(@Param("dungeonEventId") Long dungeonEventId);
}