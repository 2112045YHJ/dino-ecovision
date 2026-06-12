package com.ecovision.app.domain.region.controller;

import com.ecovision.app.domain.region.dto.EnergyUsageSumDto;
import com.ecovision.app.domain.region.entity.EnergyUsage;
import com.ecovision.app.domain.region.repository.EnergyUsageRepository;
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
        List<EnergyUsageSumDto> summaryList = energyUsageRepository.findMonthlyEnergyUsageSum(regionCode, yearPattern);
        
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
}
