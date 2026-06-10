package com.ecovision.app.domain.mission.scheduler;

import com.ecovision.app.domain.mission.entity.Mission;
import com.ecovision.app.domain.mission.repository.MissionRepository;
import com.ecovision.app.domain.user.entity.User;
import com.ecovision.app.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.sql.Date;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class MissionScheduler {

    private final UserRepository userRepository;
    private final MissionRepository missionRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 매일 자정에 모든 활성 사용자에게 중복 카테고리가 없는 3종의 일일 미션을 일괄 배정하고, 일일 누적 포인트를 초기화합니다.
     * Cron: "0 0 0 * * *" (매일 자정 00:00:00 실행)
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void assignDailyMissions() {
        log.info("[MISSION SCHEDULER START] Initiating midnight daily mission distribution and user points reset...");

        try {
            LocalDate today = LocalDate.now();

            // 1. 활성화된 DAILY 미션 목록 조회 및 슬롯별 분리
            List<Mission> activeDailyMissions = missionRepository.findByIsActiveTrueAndMissionType("DAILY");
            if (activeDailyMissions.isEmpty()) {
                log.error("[MISSION SCHEDULER ERROR] No active daily missions found in database! Aborting distribution.");
                return;
            }

            List<Mission> dayMissions = activeDailyMissions.stream()
                    .filter(m -> "DAY".equalsIgnoreCase(m.getSlotType())).collect(Collectors.toList());
            List<Mission> eveningMissions = activeDailyMissions.stream()
                    .filter(m -> "EVENING".equalsIgnoreCase(m.getSlotType())).collect(Collectors.toList());
            List<Mission> anytimeMissions = activeDailyMissions.stream()
                    .filter(m -> "ANYTIME".equalsIgnoreCase(m.getSlotType())).collect(Collectors.toList());

            if (dayMissions.isEmpty() || eveningMissions.isEmpty() || anytimeMissions.isEmpty()) {
                log.error("[MISSION SCHEDULER ERROR] Missing missions in one of the slots (DAY: {}, EVENING: {}, ANYTIME: {}).", 
                        dayMissions.size(), eveningMissions.size(), anytimeMissions.size());
                return;
            }

            // 2. 고속 데이터 일괄 리셋: 모든 활성 사용자의 일일 누적 포인트를 0으로 일괄 갱신
            String resetUsersSql = "UPDATE users SET today_points_accumulated = 0, last_point_accumulated_date = ? " +
                    "WHERE status = 'ACTIVE' AND deleted_at IS NULL";
            int resetCount = jdbcTemplate.update(resetUsersSql, Date.valueOf(today));
            log.info("[MISSION SCHEDULER] Reset today_points_accumulated to 0 for {} active users.", resetCount);

            // 3. OOM 예방을 위해 활성 사용자 목록을 페이징 조회하여 배정 처리
            int page = 0;
            int pageSize = 500;
            Page<User> userPage;

            String insertAssignmentSql = "INSERT INTO daily_mission_assignments " +
                    "(user_id, mission_id, assigned_date, slot_type, status) VALUES (?, ?, ?, ?, 'ASSIGNED')";
            
            List<Object[]> assignmentBatch = new ArrayList<>(pageSize * 3);

            do {
                userPage = userRepository.findByStatusAndDeletedAtIsNull("ACTIVE", PageRequest.of(page, pageSize));
                List<User> users = userPage.getContent();
                log.info("[MISSION SCHEDULER PROCESSING] Page: {}, Users in page: {}", page, users.size());

                for (User user : users) {
                    // 카테고리가 겹치지 않는 3가지 미션 선정
                    List<Mission> selectedMissions = selectNonOverlappingMissions(dayMissions, eveningMissions, anytimeMissions);
                    
                    if (selectedMissions != null && selectedMissions.size() == 3) {
                        for (Mission mission : selectedMissions) {
                            assignmentBatch.add(new Object[]{
                                    user.getId(), mission.getId(), Date.valueOf(today), mission.getSlotType()
                            });
                        }
                    } else {
                        log.warn("[MISSION SCHEDULER WARNING] Failed to select 3 non-overlapping category missions for user ID: {}", user.getId());
                    }
                }

                // Chunk 단위 벌크 인서트 실행
                if (!assignmentBatch.isEmpty()) {
                    executeBatchInsert(insertAssignmentSql, assignmentBatch);
                    log.info("[MISSION SCHEDULER BULK INSERT] Inserted {} assignments.", assignmentBatch.size());
                    assignmentBatch.clear();
                }

                page++;
            } while (userPage.hasNext());

            log.info("[MISSION SCHEDULER SUCCESS] Completed daily mission distribution successfully.");

        } catch (Exception e) {
            log.error("[MISSION SCHEDULER ERROR] Critical error during daily mission assignment: {}", e.getMessage(), e);
            throw new RuntimeException("Midnight mission assignment failed", e);
        }
    }

    /**
     * DAY, EVENING, ANYTIME 슬롯 미션 목록에서 서로 카테고리가 중복되지 않는 3종의 미션을 무작위 선택합니다.
     */
    private List<Mission> selectNonOverlappingMissions(List<Mission> dayList, List<Mission> eveningList, List<Mission> anytimeList) {
        // 무작위 선택을 위해 각 리스트의 사본을 생성하고 셔플
        List<Mission> dayMissions = new ArrayList<>(dayList);
        List<Mission> eveningMissions = new ArrayList<>(eveningList);
        List<Mission> anytimeMissions = new ArrayList<>(anytimeList);

        Collections.shuffle(dayMissions);
        Collections.shuffle(eveningMissions);
        Collections.shuffle(anytimeMissions);

        // 카테고리 중복 회피를 위한 탐색 매칭 루프
        for (Mission d : dayMissions) {
            for (Mission e : eveningMissions) {
                if (d.getCategory().equalsIgnoreCase(e.getCategory())) {
                    continue;
                }
                for (Mission a : anytimeMissions) {
                    if (d.getCategory().equalsIgnoreCase(a.getCategory()) || e.getCategory().equalsIgnoreCase(a.getCategory())) {
                        continue;
                    }
                    // 성공 매칭 리턴
                    return List.of(d, e, a);
                }
            }
        }
        return null;
    }

    /**
     * JdbcTemplate의 batchUpdate를 이용하여 assignments 벌크 인서트를 호출합니다.
     */
    private void executeBatchInsert(String sql, List<Object[]> batchArgs) {
        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Object[] args = batchArgs.get(i);
                ps.setLong(1, (Long) args[0]);          // user_id
                ps.setLong(2, (Long) args[1]);          // mission_id
                ps.setDate(3, (Date) args[2]);          // assigned_date
                ps.setString(4, (String) args[3]);      // slot_type
            }

            @Override
            public int getBatchSize() {
                return batchArgs.size();
            }
        });
    }
}
