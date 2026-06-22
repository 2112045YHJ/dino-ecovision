package com.ecovision.app.domain.region.repository;

import com.ecovision.app.domain.region.entity.IndustrialEnergyUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IndustrialEnergyUsageRepository extends JpaRepository<IndustrialEnergyUsage, Long> {
    Optional<IndustrialEnergyUsage> findByTargetYearAndIndustryCodeAndDataDivisionCodeAndEnergySourceNameAndRegionCode(
            String targetYear, String industryCode, String dataDivisionCode, String energySourceName, String regionCode);
}
