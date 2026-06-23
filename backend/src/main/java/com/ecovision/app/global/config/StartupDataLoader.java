package com.ecovision.app.global.config;

import com.ecovision.app.domain.region.repository.EnergyUsageRepository;
import com.ecovision.app.domain.region.service.DataCollectionService;
import com.ecovision.app.domain.world.repository.CarbonIntensityLogRepository;
import com.ecovision.app.domain.world.scheduler.WorldScheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupDataLoader {

    private final DataCollectionService dataCollectionService;
    private final EnergyUsageRepository energyUsageRepository;
    private final CarbonIntensityLogRepository carbonIntensityLogRepository;
    private final WorldScheduler worldScheduler;

    @EventListener(ApplicationReadyEvent.class)
    public void initDataOnStartup() {
        CompletableFuture.runAsync(() -> {
            try {
                log.info("[STARTUP DATA LOAD] Starting background startup data loading process...");
                initEnergyUsageData();
                initCarbonIntensityLog();
                log.info("[STARTUP DATA LOAD] Background startup data loading process completed successfully.");
            } catch (Exception e) {
                log.error("[STARTUP DATA LOAD ERROR] Error occurred during background startup data loading: {}", e.getMessage(), e);
            }
        });
    }

    private void initEnergyUsageData() {
        long currentCount = energyUsageRepository.count();
        if (currentCount > 0) {
            log.info("[STARTUP DATA LOAD] Energy usage database is not empty ({} rows). Skipping initial data load.", currentCount);
            return;
        }

        log.info("[STARTUP DATA LOAD] Energy usage database is empty. Initiating data collection from external APIs...");
        String keyStatus = dataCollectionService.getKeyStatus();

        if ("ALL_OK".equals(keyStatus)) {
            try {
                // 2025년 12개월 데이터 수집
                log.info("[STARTUP DATA LOAD] Fetching 2025 KEPCO power data...");
                for (int m = 1; m <= 12; m++) {
                    String month = String.format("%02d", m);
                    dataCollectionService.fetchAndSaveKepcoPowerData("2025", month);
                }
                
                // 2026년 1월 ~ 6월 데이터 수집
                log.info("[STARTUP DATA LOAD] Fetching 2026 KEPCO power data...");
                for (int m = 1; m <= 6; m++) {
                    String month = String.format("%02d", m);
                    dataCollectionService.fetchAndSaveKepcoPowerData("2026", month);
                }
                
                // KEA 산업부문 온실가스 데이터 수집
                log.info("[STARTUP DATA LOAD] Fetching KEA industrial data...");
                dataCollectionService.fetchAndSaveKeaIndustrialData("2025");
                dataCollectionService.fetchAndSaveKeaIndustrialData("2026");

                log.info("[STARTUP DATA LOAD] Successfully fetched and loaded fresh data from external APIs.");
            } catch (Exception e) {
                log.error("[STARTUP DATA LOAD] Failed to load fresh data from external APIs. Generating mock fallback data...", e);
                generateFallbackMockData();
            }
        } else {
            log.warn("[STARTUP DATA LOAD] API keys are not fully configured (Status: {}). Generating mock fallback data...", keyStatus);
            generateFallbackMockData();
        }
    }

    private void generateFallbackMockData() {
        try {
            log.info("[STARTUP DATA LOAD] Generating fallback mock energy usage data...");
            String[] targetRegions = {"서울특별시 중구", "서울특별시 강남구", "경기도 수원시"};
            for (String rCode : targetRegions) {
                dataCollectionService.generateFallbackDataForRegionAndYear(rCode, "2025");
                dataCollectionService.generateFallbackDataForRegionAndYear(rCode, "2026");
            }
            log.info("[STARTUP DATA LOAD] Fallback mock data has been generated successfully.");
        } catch (Exception e) {
            log.error("[STARTUP DATA LOAD ERROR] Failed to generate fallback mock data: {}", e.getMessage(), e);
        }
    }

    private void initCarbonIntensityLog() {
        long logCount = carbonIntensityLogRepository.count();
        if (logCount > 0) {
            log.info("[STARTUP DATA LOAD] Carbon intensity log database is not empty ({} rows). Skipping initial real-time log collection.", logCount);
            return;
        }

        log.info("[STARTUP DATA LOAD] Carbon intensity log database is empty. Running initial real-time log collection...");
        try {
            worldScheduler.collectCarbonIntensity();
            log.info("[STARTUP DATA LOAD] Initial real-time carbon intensity log collection completed.");
        } catch (Exception e) {
            log.error("[STARTUP DATA LOAD ERROR] Failed to run initial real-time carbon intensity log collection", e);
        }
    }
}
