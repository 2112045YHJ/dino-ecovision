package com.ecovision.app.domain.region.scheduler;

import com.ecovision.app.domain.region.service.DataCollectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class EnergyDataBatchJob {

    private final DataCollectionService dataCollectionService;

    /**
     * 매일 자정(00:00:00)에 기동하여 최근 연월의 한전 전력사용량 및 환경공단 온실가스 배출량을 수집/적재합니다.
     * cron: "0 0 0 * * *"
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void runEnergyDataCollectionBatch() {
        log.info("Starting Energy Data Collection Batch Job...");
        
        LocalDate today = LocalDate.now();
        // 당월 데이터 수집용
        String currentYear = String.valueOf(today.getYear());
        String currentMonth = String.format("%02d", today.getMonthValue());
        
        // 전월 데이터 수집용 (전월 데이터가 뒤늦게 적재되는 공공 API 특성 보완)
        LocalDate oneMonthAgo = today.minusMonths(1);
        String lastYear = String.valueOf(oneMonthAgo.getYear());
        String lastMonth = String.format("%02d", oneMonthAgo.getMonthValue());

        try {
            // 1. 당월 및 전월 한전 전력사용량 데이터 수집
            dataCollectionService.fetchAndSaveKepcoPowerData(lastYear, lastMonth);
            dataCollectionService.fetchAndSaveKepcoPowerData(currentYear, currentMonth);

            // 2. 당해 연도 및 전해 연도 온실가스 배출량 데이터 수집
            dataCollectionService.fetchAndSaveKecoCarbonData(lastYear);
            dataCollectionService.fetchAndSaveKecoCarbonData(currentYear);

            log.info("Energy Data Collection Batch Job completed successfully.");
        } catch (Exception e) {
            log.error("Error occurred during Energy Data Collection Batch Job: {}", e.getMessage(), e);
        }
    }
}
