package com.ecovision.app.domain.dungeon.scheduler;

import com.ecovision.app.domain.dungeon.entity.DungeonEvent;
import com.ecovision.app.domain.dungeon.repository.DungeonEventRepository;
import com.ecovision.app.domain.dungeon.repository.DungeonMissionAssignmentRepository;
import com.ecovision.app.domain.dungeon.service.DungeonMissionIssueService;
import com.ecovision.app.domain.world.entity.CarbonIntensityLog;
import com.ecovision.app.domain.world.repository.CarbonIntensityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DungeonScheduler {

    private final CarbonIntensityLogRepository carbonIntensityLogRepository;
    private final DungeonEventRepository dungeonEventRepository;
    private final DungeonMissionAssignmentRepository dungeonMissionAssignmentRepository;
    private final DungeonMissionIssueService dungeonMissionIssueService;

    /**
     * WorldScheduler가 구동된 10초 후에 전력 상황을 점검하여 던전을 발령하거나 해제합니다.
     * Cron: "10 * / 5 * * * *" (매 5분 10초에 구동)
     */
    @Scheduled(cron = "10 */5 * * * *")
    @Transactional
    public void manageDungeonLifecycle() {
        log.info("[DUNGEON SCHEDULER START] Checking power grid state for dungeon lifecycle...");

        // 1. 가장 최신의 전력/탄소집약도 로그 가져오기
        Optional<CarbonIntensityLog> latestLogOpt = carbonIntensityLogRepository.findFirstByOrderByMeasuredAtDesc();
        if (latestLogOpt.isEmpty()) {
            log.warn("[DUNGEON SCHEDULER] No carbon intensity logs found. Skipping cycle.");
            return;
        }

        CarbonIntensityLog latestLog = latestLogOpt.get();
        double reserveRate = latestLog.getReserveRate() != null ? latestLog.getReserveRate().doubleValue() : 15.0;

        // 2. 현재 ACTIVE 상태인 던전 존재 여부 파악
        Optional<DungeonEvent> activeDungeonOpt = dungeonEventRepository.findFirstByStatusOrderByStartedAtDesc("ACTIVE");

        if (activeDungeonOpt.isEmpty()) {
            // A. 활성 던전이 없고, 전력 예비율이 10% 미만으로 떨어진 경우 -> 던전 발령
            if (reserveRate < 10.0) {
                triggerDungeon(latestLog, reserveRate);
            } else {
                log.info("[DUNGEON SCHEDULER] Grid is stable (Reserve Rate: {}%). No action taken.", reserveRate);
            }
        } else {
            // B. 이미 활성 던전이 기 가동 중인 경우 -> 던전 종료 조건 체크
            DungeonEvent activeDungeon = activeDungeonOpt.get();
            checkAndEndDungeon(activeDungeon, reserveRate);
        }
    }

    /**
     * 전력 예비율 비상 경보 던전을 신규 발령합니다.
     */
    private void triggerDungeon(CarbonIntensityLog latestLog, double reserveRate) {
        log.warn("[DUNGEON TRIGGER] Reserve rate dropped to {}% (< 10%). Triggering carbon dungeon!", reserveRate);

        LocalDateTime now = LocalDateTime.now();
        DungeonEvent newDungeon = DungeonEvent.builder()
                .title("전력 공급 예비율 비상! 탄소 절감 피크 던전 발령")
                .triggerType("AUTO")
                .reserveRate(BigDecimal.valueOf(reserveRate))
                .carbonIntensity(latestLog.getCarbonIntensity())
                .rewardMultiplier(new BigDecimal("2.00")) // 던전 미션은 보상 2배
                .status("ACTIVE")
                .startedAt(now)
                .endedAt(now.plusHours(1)) // 기본 종료 예정 시각은 60분 뒤
                .build();

        dungeonEventRepository.save(newDungeon);
        log.info("[DUNGEON TRIGGER SUCCESS] Active dungeon generated. ID: {}, Ends at: {}", 
                newDungeon.getId(), newDungeon.getEndedAt());
        
        // 발령 직후: 활성 사용자(ACTIVE + 공룡 보유)에게 던전 미션 2개 일괄 배정.
        // 같은 manageDungeonLifecycle 트랜잭션에 참여하므로 발령+배정이 원자적으로 처리된다.
        int issued = dungeonMissionIssueService.issueForDungeon(newDungeon.getId());
        log.info("[DUNGEON TRIGGER] 던전 미션 배정 행 수: {} (dungeonId={})", issued, newDungeon.getId());
    }

    /**
     * 기존 활성 던전이 해제 조건(예비율 복구 또는 60분 경과)을 충족하는지 검사하고 종료 처리합니다.
     */
    private void checkAndEndDungeon(DungeonEvent activeDungeon, double reserveRate) {
        LocalDateTime now = LocalDateTime.now();
        
        // 경과 시간 계산
        long elapsedMinutes = Duration.between(activeDungeon.getStartedAt(), now).toMinutes();

        boolean isReserveRecovered = reserveRate >= 10.0;
        boolean isTimeExpired = elapsedMinutes >= 60;

        if (isReserveRecovered || isTimeExpired) {
            log.info("[DUNGEON TERMINATING] Ending active dungeon ID: {} (Reason: Recovered={}, Expired={})", 
                    activeDungeon.getId(), isReserveRecovered, isTimeExpired);

            // 1. 던전 이벤트 상태 종료
            activeDungeon.setStatus("ENDED");
            activeDungeon.setEndedAt(now);
            dungeonEventRepository.save(activeDungeon);

            // 2. 해당 던전 내 미완료된 사용자 미션 일괄 EXPIRED 처리
            int expiredCount = dungeonMissionAssignmentRepository.updateStatusByDungeonEventIdAndStatus(
                    activeDungeon.getId(), "ASSIGNED", "EXPIRED"
            );

            log.info("[DUNGEON TERMINATING SUCCESS] Dungeon ID {} successfully ended. Expired assignments: {}", 
                    activeDungeon.getId(), expiredCount);
        } else {
            log.info("[DUNGEON RUNNING] Active dungeon ID {} remains ACTIVE. Elapsed: {} min, Current Reserve Rate: {}%", 
                    activeDungeon.getId(), elapsedMinutes, reserveRate);
        }
    }
}
