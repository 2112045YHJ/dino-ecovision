package com.ecovision.app.domain.dungeon.service;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.ecovision.app.domain.dungeon.repository.DungeonAssignmentQueryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

//	던전 발령 시 활성 사용자에게 던전 미션을 일괄 배정.
//	정책(현재 프로젝트 기준):
//	- 대상: status='ACTIVE' + 공룡 보유 사용자 (게임 진행 중)
//	- 미션: DUNGEON 활성 풀에서 dungeon_event_id 기반 결정론적 2개 (같은 던전 = 모든 사용자 같은 2개)
//	- 멱등: 이미 이 던전에 배정된 사용자는 제외 (유니크 제약이 없어 애플리케이션에서 보장)
//	- 대량 INSERT 는 JdbcTemplate 배치 (MissionAssignmentService 와 동일 패턴)
//	호출자(DungeonScheduler.triggerDungeon)의 트랜잭션에 참여하므로 별도 @Transactional 없음.
@Service
@RequiredArgsConstructor
@Slf4j
public class DungeonMissionIssueService {

	//	던전당 배정 미션 수 (SB-05: 던전 미션 2개)
	private static final int DUNGEON_MISSION_COUNT = 2;

	private static final String INSERT_SQL =
			"INSERT INTO dungeon_mission_assignments (dungeon_event_id, user_id, mission_id, status) "
			+ "VALUES (?, ?, ?, 'ASSIGNED')";

	private final DungeonAssignmentQueryRepository assignmentQueryRepository;
	private final JdbcTemplate jdbcTemplate;

	//	발령된 던전(dungeonEventId)에 대해 대상 사용자에게 미션 2개씩 배정. 발급된 행 수 반환.
	public int issueForDungeon(Long dungeonEventId) {
		List<Long> pool = assignmentQueryRepository.findActiveDungeonMissionIds();
		if (pool.size() < DUNGEON_MISSION_COUNT) {
			log.warn("[DUNGEON-ISSUE] 활성 던전 미션이 {}개 미만이라 배정을 건너뜁니다. dungeonId={}",
					DUNGEON_MISSION_COUNT, dungeonEventId);
			return 0;
		}

		List<Long> missionIds = pickDeterministic(pool, dungeonEventId);

		List<Long> targets = assignmentQueryRepository.findAssignmentTargetUserIds();
		if (targets.isEmpty()) {
			log.info("[DUNGEON-ISSUE] 배정 대상 사용자가 없습니다. dungeonId={}", dungeonEventId);
			return 0;
		}

		// 멱등: 이미 배정된 사용자 제외
		List<Long> already = assignmentQueryRepository.findAlreadyAssignedUserIds(dungeonEventId);
		java.util.Set<Long> alreadySet = new java.util.HashSet<>(already);

		List<Object[]> batch = new ArrayList<>();
		for (Long userId : targets) {
			if (alreadySet.contains(userId)) {
				continue;
			}
			for (Long missionId : missionIds) {
				batch.add(new Object[] { dungeonEventId, userId, missionId });
			}
		}

		if (batch.isEmpty()) {
			log.info("[DUNGEON-ISSUE] 신규 배정 대상이 없습니다(모두 기배정). dungeonId={}", dungeonEventId);
			return 0;
		}

		batchInsert(batch);
		log.info("[DUNGEON-ISSUE] 던전 미션 배정 완료. dungeonId={}, 미션={}, 신규배정행={}",
				dungeonEventId, missionIds, batch.size());
		return batch.size();
	}

	//	정렬된 풀에서 dungeonEventId 를 시드로 서로 다른 2개를 결정론적으로 선택.
	//	같은 던전 = 같은 미션(재실행 안전), 다른 던전 = 다른 셋업 가능성.
	private List<Long> pickDeterministic(List<Long> sortedPool, Long dungeonEventId) {
		int len = sortedPool.size();
		long seed = dungeonEventId == null ? 0L : dungeonEventId;
		int idx1 = (int) Math.floorMod(seed, len);
		int offset = Math.max(1, len / 2);
		int idx2 = (int) Math.floorMod(seed + offset, len);
		if (idx2 == idx1) {
			idx2 = (idx1 + 1) % len;
		}
		List<Long> picked = new ArrayList<>(DUNGEON_MISSION_COUNT);
		picked.add(sortedPool.get(idx1));
		picked.add(sortedPool.get(idx2));
		return picked;
	}

	private void batchInsert(List<Object[]> batchArgs) {
		jdbcTemplate.batchUpdate(INSERT_SQL, new BatchPreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement ps, int i) throws SQLException {
				Object[] args = batchArgs.get(i);
				ps.setLong(1, (Long) args[0]);
				ps.setLong(2, (Long) args[1]);
				ps.setLong(3, (Long) args[2]);
			}

			@Override
			public int getBatchSize() {
				return batchArgs.size();
			}
		});
	}
}