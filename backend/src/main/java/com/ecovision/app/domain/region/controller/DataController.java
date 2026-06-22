package com.ecovision.app.domain.region.controller;

import com.ecovision.app.domain.region.dto.EnergyUsageSumDto;
import com.ecovision.app.domain.region.dto.DataFilterDto;
import com.ecovision.app.domain.region.entity.EnergyUsage;
import com.ecovision.app.domain.region.repository.EnergyUsageRepository;
import com.ecovision.app.domain.region.service.DataCollectionService;
import com.ecovision.app.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataController {

    private final EnergyUsageRepository energyUsageRepository;
    private final DataCollectionService dataCollectionService;

    /**
     * 대시보드용 월별 전력/탄소 통계 집계 데이터 반환
     * GET /api/data/summary?year={year}&regionCode={regionCode}
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<List<EnergyUsageSumDto>>> getEnergySummary(
            @RequestParam("year") String year,
            @RequestParam("regionCode") String regionCode) {
        log.info("Request energy summary for year: {}, regionCode: {}", year, regionCode);
        
        // DDL 규격상 usage_year_month가 YYYY-MM(7자) 또는 YYYYMM(6자)일 수 있으므로 두 가지 패턴을 모두 지원
        String yearPattern = year + "%";
        List<EnergyUsageSumDto> summaryList;
        if ("1111000000".equals(regionCode)) {
            summaryList = energyUsageRepository.findMonthlyEnergyUsageSumAllRegions(yearPattern);
        } else {
            summaryList = energyUsageRepository.findMonthlyEnergyUsageSum(regionCode, yearPattern);
        }
        
        if (summaryList.isEmpty()) {
            log.info("No data found in DB for regionCode: {}, year: {}", regionCode, year);
        }
        
        return ResponseEntity.ok(ApiResponse.success(summaryList));
    }

    /**
     * 원시 추이 리스트 반환
     * GET /api/data/greenhouse?regionCode={regionCode}&startYearMonth={startMonth}&endYearMonth={endMonth}
     */
    @GetMapping("/greenhouse")
    public ResponseEntity<ApiResponse<List<EnergyUsage>>> getGreenhouseData(
            @RequestParam("regionCode") String regionCode,
            @RequestParam("startYearMonth") String startMonth,
            @RequestParam("endYearMonth") String endMonth) {
        log.info("Request greenhouse details for regionCode: {}, period: {} ~ {}", regionCode, startMonth, endMonth);
        
        List<EnergyUsage> detailList = energyUsageRepository
                .findByRegionCodeAndUsageYearMonthBetweenOrderByUsageYearMonthAsc(regionCode, startMonth, endMonth);
                
        return ResponseEntity.ok(ApiResponse.success(detailList));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<?>> resetAndFetchData(
            @RequestParam(value = "useMock", required = false, defaultValue = "false") boolean useMock) {
        log.info("Resetting energy usage database. useMock: {}", useMock);
        try {
            energyUsageRepository.deleteAll();
            
            if (useMock) {
                // 개발용 모의 데이터 적재 (3개 대표 지역)
                String[] targetRegions = {"서울특별시 중구", "서울특별시 강남구", "경기도 수원시"};
                for (String rCode : targetRegions) {
                    dataCollectionService.generateFallbackDataForRegionAndYear(rCode, "2025");
                    dataCollectionService.generateFallbackDataForRegionAndYear(rCode, "2026");
                }
                return ResponseEntity.ok(ApiResponse.success("개발용 모의 데이터를 성공적으로 적재했습니다."));
            } else {
                // API 키 검증
                String keyStatus = dataCollectionService.getKeyStatus();
                if (!"ALL_OK".equals(keyStatus)) {
                    log.warn("Cannot fetch fresh data. API Key status: {}", keyStatus);
                    String errorMsg = "API 키가 등록되어 있지 않아 수집할 수 없습니다.";
                    if ("ALL_MISSING".equals(keyStatus)) {
                        errorMsg = "KEPCO(한전), KECO(환경공단) 및 KEA(에너지공단) API 키가 모두 누락되었습니다. application.properties 설정을 확인해 주세요.";
                    } else if ("KEPCO_MISSING".equals(keyStatus)) {
                        errorMsg = "KEPCO(한전) API 키가 누락되었습니다.";
                    } else if ("KECO_MISSING".equals(keyStatus)) {
                        errorMsg = "KECO(환경공단) API 키가 누락되었습니다.";
                    } else if ("KEA_MISSING".equals(keyStatus)) {
                        errorMsg = "KEA(에너지공단) API 키가 누락되었습니다.";
                    }
                    return ResponseEntity.status(400)
                            .body(ApiResponse.error("MISSING_API_KEY", errorMsg));
                }

                // 2025년 12개월 데이터 수집
                for (int m = 1; m <= 12; m++) {
                    String month = String.format("%02d", m);
                    dataCollectionService.fetchAndSaveKepcoPowerData("2025", month);
                }
                
                // 2026년 1월 ~ 6월 데이터 수집
                for (int m = 1; m <= 6; m++) {
                    String month = String.format("%02d", m);
                    dataCollectionService.fetchAndSaveKepcoPowerData("2026", month);
                }
                
                // 온실가스 데이터 수집
                dataCollectionService.fetchAndSaveKecoCarbonData("2025");
                dataCollectionService.fetchAndSaveKecoCarbonData("2026");

                // KEA 산업부문 온실가스 데이터 수집
                dataCollectionService.fetchAndSaveKeaIndustrialData("2025");
                dataCollectionService.fetchAndSaveKeaIndustrialData("2026");
                
                return ResponseEntity.ok(ApiResponse.success("데이터베이스를 초기화하고 API를 통해 최신 데이터를 성공적으로 수집했습니다."));
            }
        } catch (Exception e) {
            log.error("Failed to reset and fetch data", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("RESET_FAILED", "데이터 초기화 및 수집 실패: " + e.getMessage()));
        }
    }

    /**
     * 적재된 데이터의 고유 연도 및 지역 목록 반환
     * GET /api/data/filters
     */
    @GetMapping("/filters")
    public ResponseEntity<ApiResponse<DataFilterDto>> getDataFilters() {
        log.info("Requesting available energy data filter options...");
        List<String> years = energyUsageRepository.findDistinctYears();
        List<String> regions = energyUsageRepository.findDistinctRegions();
        return ResponseEntity.ok(ApiResponse.success(new DataFilterDto(years, regions)));
    }
}
