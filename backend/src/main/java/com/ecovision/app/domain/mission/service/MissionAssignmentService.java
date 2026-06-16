package com.ecovision.app.domain.mission.service;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Collections;

import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.ecovision.app.domain.mission.entity.Mission;
import com.ecovision.app.domain.mission.repository.MissionRepository;
import com.ecovision.app.domain.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// 단일 사용자 일일 미션 배정 + 슬롯/카테고리 선정 로직
// 스케줄러(대량)와 온보딩(1인)이 선정 로직을 공유하되, 배정 방식은 각 용도에 맞춤
//트랜잭션 경계 메서드(@Transactional)는 반드시 '다른 빈(스케줄러 등)'에서 호출해야 적용됨(self-invocation 주의).

@Service
@RequiredArgsConstructor
@Slf4j
public class MissionAssignmentService {

	private final MissionRepository missionRepository;
	private final JdbcTemplate jdbcTemplate;

	private static final String INSERT_SQL = "INSERT INTO daily_mission_assignments "
			+ "(user_id, mission_id, assigned_date, slot_type, status) VALUES (?, ?, ?, ?, 'ASSIGNED')";

	private static final String EXISTS_SQL = "SELECT COUNT(*) FROM daily_mission_assignments WHERE user_id = ? AND assigned_date = ?";

	private static final String RESET_POINTS_SQL =
			"UPDATE users SET today_points_accumulated = 0, last_point_accumulated_date = ? " +
			"WHERE status = 'ACTIVE' AND deleted_at IS NULL";
	
	// ===== 온보딩용: 단일 사용자 (독립 트랜잭션 + 멱등) =====

	//	부화 직후 호출. REQUIRES_NEW로 독립 실행 → 실패해도 호출자(부화) 트랜잭션에 영향 없음.
	//	오늘 배정이 이미 있으면 아무것도 하지 않는다(중복 INSERT 방지).
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void assignForUser(Long userId, LocalDate today) {
		Integer existing = jdbcTemplate.queryForObject(EXISTS_SQL, Integer.class, userId, Date.valueOf(today));
		if (existing != null && existing > 0) {
			log.info("[ASSIGN] user {} already has assignments for {}. skip.", userId, today);
			return;
		}

		List<Mission> active = missionRepository.findByIsActiveTrueAndMissionType("DAILY");
		List<Mission> day = bySlot(active, "DAY");
		List<Mission> evening = bySlot(active, "EVENING");
		List<Mission> anytime = bySlot(active, "ANYTIME");

		if (day.isEmpty() || evening.isEmpty() || anytime.isEmpty()) {
			log.warn("[ASSIGN] missing slot missions (DAY:{}, EVENING:{}, ANYTIME:{}). skip user {}.",
					day.size(), evening.size(), anytime.size(), userId);
			return;
		}

		List<Mission> selected = selectNonOverlappingMissions(day, evening, anytime);
		if (selected == null || selected.size() != 3) {
			log.warn("[ASSIGN] failed to pick 3 non-overlapping missions for user {}.", userId);
			return;
		}

		List<Object[]> batch = new ArrayList<>(3);
		for (Mission m : selected) {
			batch.add(new Object[]{ userId, m.getId(), Date.valueOf(today), m.getSlotType() });
		}
		batchInsert(batch);
		log.info("[ASSIGN] assigned 3 missions to user {} for {}.", userId, today);
	}

	// ===== 배치용: 페이지 단위 (각각 독립 트랜잭션) =====

	//	활성 사용자 일일 누적 포인트 리셋. 자기 트랜잭션에서 끝나 바로 커밋·락 해제.
	@Transactional
	public void resetTodayPoints(LocalDate today) {
		int count = jdbcTemplate.update(RESET_POINTS_SQL, Date.valueOf(today));
		log.info("[SCHEDULER] reset today_points_accumulated for {} active users.", count);
	}
	
	//	사용자 한 페이지(청크)만 선정 + 벌크 인서트. 페이지 단위로 커밋되어 락 보유 시간을 짧게 끊는다.
	@Transactional
	public void assignForUserPage(List<User> users,
			List<Mission> day, List<Mission> evening, List<Mission> anytime, LocalDate today) {
		List<Object[]> batch = new ArrayList<>(users.size() * 3);
		for (User user : users) {
			List<Mission> selected = selectNonOverlappingMissions(day, evening, anytime);
			if (selected != null && selected.size() == 3) {
				for (Mission m : selected) {
					batch.add(new Object[]{ user.getId(), m.getId(), Date.valueOf(today), m.getSlotType() });
				}
			} else {
				log.warn("[SCHEDULER] failed to pick 3 missions for user {}.", user.getId());
			}
		}
		if (!batch.isEmpty()) {
			batchInsert(batch);
		}
	}

	// ===== 공유 선정/유틸 로직 =====

	public List<Mission> bySlot(List<Mission> all, String slot) {
		return all.stream()
				.filter(m -> slot.equalsIgnoreCase(m.getSlotType()))
				.collect(Collectors.toList());
	}

	public List<Mission> selectNonOverlappingMissions(
			List<Mission> dayList, List<Mission> eveningList, List<Mission> anytimeList) {
		List<Mission> dayMissions = new ArrayList<>(dayList);
		List<Mission> eveningMissions = new ArrayList<>(eveningList);
		List<Mission> anytimeMissions = new ArrayList<>(anytimeList);

		Collections.shuffle(dayMissions);
		Collections.shuffle(eveningMissions);
		Collections.shuffle(anytimeMissions);

		for (Mission d : dayMissions) {
			for (Mission e : eveningMissions) {
				if (d.getCategory().equalsIgnoreCase(e.getCategory())) {
					continue;
				}
				for (Mission a : anytimeMissions) {
					if (d.getCategory().equalsIgnoreCase(a.getCategory())
							|| e.getCategory().equalsIgnoreCase(a.getCategory())) {
						continue;
					}
					return List.of(d, e, a);
				}
			}
		}
		return null;
	}

	public void batchInsert(List<Object[]> batchArgs) {
		jdbcTemplate.batchUpdate(INSERT_SQL, new BatchPreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement ps, int i) throws SQLException {
				Object[] args = batchArgs.get(i);
				ps.setLong(1, (Long) args[0]);
				ps.setLong(2, (Long) args[1]);
				ps.setDate(3, (Date) args[2]);
				ps.setString(4, (String) args[3]);
			}
			@Override
			public int getBatchSize() {
				return batchArgs.size();
			}
		});
	}
}
