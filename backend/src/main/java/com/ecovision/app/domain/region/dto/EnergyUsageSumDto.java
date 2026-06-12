package com.ecovision.app.domain.region.dto;

import com.ecovision.app.domain.region.entity.EnergyType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EnergyUsageSumDto {
    private String usageYearMonth;
    private EnergyType energyType;
    private BigDecimal sumUsageAmount;
    private BigDecimal sumCarbonEmissionKg;
}
