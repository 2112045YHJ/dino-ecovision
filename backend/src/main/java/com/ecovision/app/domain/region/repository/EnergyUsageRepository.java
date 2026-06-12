package com.ecovision.app.domain.region.repository;

import com.ecovision.app.domain.region.dto.EnergyUsageSumDto;
import com.ecovision.app.domain.region.entity.EnergyUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnergyUsageRepository extends JpaRepository<EnergyUsage, Long> {

    /**
     * 특정 지역 코드와 연도 기준(예: '2026%' 또는 '2026-%')으로 월별 에너지 사용량 및 탄소 배출량 합계를 집계하여 반환합니다.
     */
    @Query("SELECT new com.ecovision.app.domain.region.dto.EnergyUsageSumDto(" +
            "e.usageYearMonth, e.energyType, SUM(e.usageAmount), SUM(e.carbonEmissionKg)) " +
            "FROM EnergyUsage e " +
            "WHERE e.regionCode = :regionCode AND e.usageYearMonth LIKE :yearPattern " +
            "GROUP BY e.usageYearMonth, e.energyType " +
            "ORDER BY e.usageYearMonth ASC")
    List<EnergyUsageSumDto> findMonthlyEnergyUsageSum(
            @Param("regionCode") String regionCode,
            @Param("yearPattern") String yearPattern);

    java.util.Optional<EnergyUsage> findByRegionCodeAndUsageYearMonthAndEnergyType(
            String regionCode, String usageYearMonth, com.ecovision.app.domain.region.entity.EnergyType energyType);

    List<EnergyUsage> findByRegionCodeAndUsageYearMonthBetweenOrderByUsageYearMonthAsc(
            String regionCode, String startYearMonth, String endYearMonth);
}
