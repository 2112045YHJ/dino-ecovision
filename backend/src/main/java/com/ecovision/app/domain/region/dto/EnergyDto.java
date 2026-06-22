package com.ecovision.app.domain.region.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class EnergyDto {

    // 1. KEPCO API 응답 매핑 레코드
    public record KepcoPowerResponse(
            List<KepcoDataItem> data,
            int totalCount
    ) {}

    public record KepcoDataItem(
            String year,
            String month,
            String city,
            String metro,
            Double powerUsage,
            Integer houseCnt,
            Integer bill
    ) {}

    // 2. KECO API 응답 매핑 레코드
    public record KecoCarbonResponse(
            String pageNo,
            Integer totalCount,
            String numOfRows,
            KecoOpenTable opentable
    ) {}

    public record KecoOpenTable(
            @JsonProperty("field") List<KecoItem> row
    ) {}

    public record KecoItem(
            @JsonProperty("TRGT_YEAR") String targetYear,
            @JsonProperty("DATA_DVSN_CD") String dataDivisionCode,
            @JsonProperty("TOB_DVSN_NM") String tobDivisionName,
            @JsonProperty("ENGSRC_NM") String energySourceName,
            @JsonProperty("USG_NM") String usageName,
            @JsonProperty("USEMS_QNTY") Double usemsQuantity,
            @JsonProperty("UNIT_NM") String unitName,
            @JsonProperty("LOCL_DVSN_NM") String localDivisionName
    ) {}

    // 3. KEA API 응답 매핑 레코드
    public record KeaIndustrialResponse(
            String pageNo,
            Integer totalCount,
            String numOfRows,
            KeaOpenTable opentable
    ) {}

    public record KeaOpenTable(
            @JsonProperty("field") List<KeaItem> row
    ) {}

    public record KeaItem(
            @JsonProperty("TRGT_YEAR") String targetYear,
            @JsonProperty("KSIC_CD") String ksicCode,
            @JsonProperty("DATA_DVSN_CD") String dataDivisionCode,
            @JsonProperty("ENGSRC_DVSN_NM") String energySourceDivisionName,
            @JsonProperty("ENGSRC_NM") String energySourceName,
            @JsonProperty("LOCL_DVSN_NM") String localDivisionName,
            @JsonProperty("USEMS_QNTY_NIDVAL") String usemsQuantityNidval,
            @JsonProperty("UNIT_NM") String unitName
    ) {}

    // 4. 대시보드 통계 반환용 DTO
    public record EnergySummaryResponse(
            int month,                   // 1 ~ 12
            Double totalPowerUsage,      // kWh
            Double totalCarbonEmission   // kgCO2eq
    ) {
        public EnergySummaryResponse(String monthStr, Double totalPowerUsage, Double totalCarbonEmission) {
            this(
                Integer.parseInt(monthStr.replaceAll("[^0-9]", "")), // 안전하게 숫자만 파싱
                totalPowerUsage != null ? totalPowerUsage : 0.0,
                totalCarbonEmission != null ? totalCarbonEmission : 0.0
            );
        }
    }
}
