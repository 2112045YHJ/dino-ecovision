package com.ecovision.app.domain.region.scheduler;

import com.ecovision.app.domain.region.service.DataCollectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class EnergyDataBatchJob {

    private final DataCollectionService dataCollectionService;

    /**
     * 한전 전력사용량 데이터 수집 배치
     * 주기: 매주 일요일 새벽 2시 ("0 0 2 * * SUN")
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    @SchedulerLock(name = "kepcoPowerCollectionBatchLock", lockAtLeastFor = "10m", lockAtMostFor = "50m")
    public void runKepcoPowerCollectionBatch() {
        log.info("Starting KEPCO Power Data Collection Batch Job...");
        
        LocalDate today = LocalDate.now();
        String currentYear = String.valueOf(today.getYear());
        String currentMonth = String.format("%02d", today.getMonthValue());
        
        LocalDate oneMonthAgo = today.minusMonths(1);
        String lastYear = String.valueOf(oneMonthAgo.getYear());
        String lastMonth = String.format("%02d", oneMonthAgo.getMonthValue());

        try {
            dataCollectionService.fetchAndSaveKepcoPowerData(lastYear, lastMonth);
            dataCollectionService.fetchAndSaveKepcoPowerData(currentYear, currentMonth);
            log.info("KEPCO Power Data Collection Batch Job completed successfully.");
        } catch (Exception e) {
            log.error("Error occurred during KEPCO Power Data Collection Batch Job: {}", e.getMessage(), e);
        }
    }


    /**
     * 한국에너지공단 산업부문 에너지/온실가스 데이터 수집 배치
     * 주기: 매월 1일 새벽 4시 ("0 0 4 1 * *")
     */
    @Scheduled(cron = "0 0 4 1 * *")
    @SchedulerLock(name = "keaIndustrialCollectionBatchLock", lockAtLeastFor = "10m", lockAtMostFor = "50m")
    public void runKeaIndustrialCollectionBatch() {
        log.info("Starting KEA Industrial Data Collection Batch Job...");
        
        LocalDate today = LocalDate.now();
        String currentYear = String.valueOf(today.getYear());
        String lastYear = String.valueOf(today.minusYears(1).getYear());

        try {
            dataCollectionService.fetchAndSaveKeaIndustrialData(lastYear);
            dataCollectionService.fetchAndSaveKeaIndustrialData(currentYear);
            log.info("KEA Industrial Data Collection Batch Job completed successfully.");
        } catch (Exception e) {
            log.error("Error occurred during KEA Industrial Data Collection Batch Job: {}", e.getMessage(), e);
        }
    }
}
