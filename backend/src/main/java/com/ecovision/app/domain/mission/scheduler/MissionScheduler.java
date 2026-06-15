package com.ecovision.app.domain.mission.scheduler;

import com.ecovision.app.domain.mission.entity.Mission;
import com.ecovision.app.domain.mission.repository.MissionRepository;
import com.ecovision.app.domain.mission.service.MissionAssignmentService;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.entity.UserStatus;
import com.ecovision.app.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MissionScheduler {

    private final UserRepository userRepository;
    private final MissionRepository missionRepository;
    private final MissionAssignmentService missionAssignmentService;

    /**
     * 매일 자정에 모든 활성 사용자에게 중복 카테고리가 없는 3종의 일일 미션을 일괄 배정하고, 일일 누적 포인트를 초기화합니다.
     * Cron: "0 0 0 * * *" (매일 자정 00:00:00 실행)
     */
	public void assignDailyMissions() {
		log.info("[MISSION SCHEDULER START] midnight daily mission distribution...");
		LocalDate today = LocalDate.now();

		// 1. 활성 DAILY 미션 조회 및 슬롯 분리
		List<Mission> active = missionRepository.findByIsActiveTrueAndMissionType("DAILY");
		if (active.isEmpty()) {
			log.error("[MISSION SCHEDULER ERROR] No active daily missions. aborting.");
			return;
		}

		List<Mission> dayMissions = missionAssignmentService.bySlot(active, "DAY");
		List<Mission> eveningMissions = missionAssignmentService.bySlot(active, "EVENING");
		List<Mission> anytimeMissions = missionAssignmentService.bySlot(active, "ANYTIME");

		if (dayMissions.isEmpty() || eveningMissions.isEmpty() || anytimeMissions.isEmpty()) {
			log.error("[MISSION SCHEDULER ERROR] Missing slot missions (DAY:{}, EVENING:{}, ANYTIME:{}). aborting.",
					dayMissions.size(), eveningMissions.size(), anytimeMissions.size());
			return;
		}

		// 2. 포인트 리셋 — 독립 트랜잭션 (바로 커밋되어 락 해제)
		try {
			missionAssignmentService.resetTodayPoints(today);
		} catch (Exception e) {
			log.error("[MISSION SCHEDULER ERROR] today_points reset failed.", e);
			// 리셋 실패해도 배정은 진행 (정책상 배정이 더 중요)
		}

		// 3. 사용자 페이징 — 페이지마다 독립 트랜잭션, 한 페이지 실패가 다음 페이지를 막지 않음
		int page = 0;
		int pageSize = 500;
		Page<User> userPage;
		do {
			userPage = userRepository.findByStatusAndDeletedAtIsNull(UserStatus.ACTIVE, PageRequest.of(page, pageSize));
			List<User> users = userPage.getContent();
			log.info("[MISSION SCHEDULER PROCESSING] page: {}, users: {}", page, users.size());

			try {
				missionAssignmentService.assignForUserPage(users, dayMissions, eveningMissions, anytimeMissions, today);
			} catch (Exception e) {
				log.error("[MISSION SCHEDULER ERROR] page {} failed, continue next page.", page, e);
			}
			page++;
		} while (userPage.hasNext());

		log.info("[MISSION SCHEDULER SUCCESS] daily mission distribution finished.");
	}

    /**
     * DAY, EVENING, ANYTIME 슬롯 미션 목록에서 서로 카테고리가 중복되지 않는 3종의 미션을 무작위 선택합니다.
     */
    // => service 쪽으로 옮겼으므로 주석 처리
//    private List<Mission> selectNonOverlappingMissions(List<Mission> dayList, List<Mission> eveningList, List<Mission> anytimeList) {
//        // 무작위 선택을 위해 각 리스트의 사본을 생성하고 셔플
//        List<Mission> dayMissions = new ArrayList<>(dayList);
//        List<Mission> eveningMissions = new ArrayList<>(eveningList);
//        List<Mission> anytimeMissions = new ArrayList<>(anytimeList);
//
//        Collections.shuffle(dayMissions);
//        Collections.shuffle(eveningMissions);
//        Collections.shuffle(anytimeMissions);
//
//        // 카테고리 중복 회피를 위한 탐색 매칭 루프
//        for (Mission d : dayMissions) {
//            for (Mission e : eveningMissions) {
//                if (d.getCategory().equalsIgnoreCase(e.getCategory())) {
//                    continue;
//                }
//                for (Mission a : anytimeMissions) {
//                    if (d.getCategory().equalsIgnoreCase(a.getCategory()) || e.getCategory().equalsIgnoreCase(a.getCategory())) {
//                        continue;
//                    }
//                    // 성공 매칭 리턴
//                    return List.of(d, e, a);
//                }
//            }
//        }
//        return null;
//    }

    /**
     * JdbcTemplate의 batchUpdate를 이용하여 assignments 벌크 인서트를 호출합니다.
     */
    // => service 쪽으로 옮겼으므로 주석 처리
//    private void executeBatchInsert(String sql, List<Object[]> batchArgs) {
//        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
//            @Override
//            public void setValues(PreparedStatement ps, int i) throws SQLException {
//                Object[] args = batchArgs.get(i);
//                ps.setLong(1, (Long) args[0]);          // user_id
//                ps.setLong(2, (Long) args[1]);          // mission_id
//                ps.setDate(3, (Date) args[2]);          // assigned_date
//                ps.setString(4, (String) args[3]);      // slot_type
//            }
//
//            @Override
//            public int getBatchSize() {
//                return batchArgs.size();
//            }
//        });
//    }
}
