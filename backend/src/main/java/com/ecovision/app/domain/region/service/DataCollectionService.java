package com.ecovision.app.domain.region.service;

import com.ecovision.app.domain.region.dto.EnergyDto;
import com.ecovision.app.domain.region.entity.EnergyType;
import com.ecovision.app.domain.region.entity.EnergyUsage;
import com.ecovision.app.domain.region.repository.EnergyUsageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataCollectionService {

    private final EnergyUsageRepository energyUsageRepository;
    private final ObjectMapper objectMapper;
    private final WebClient webClient = WebClient.builder().build();

    @Value("${openapi.kepco-key:dummy-key}")
    private String kepcoKey;

    @Value("${openapi.keco-key:dummy-key}")
    private String kecoKey;

    private static final String KEPCO_API_URL = "https://bigdata.kepco.co.kr/openapi/v1/powerUsage/houseAve.do";
    private static final String KECO_API_URL = "http://apis.data.go.kr/B553530/GHG_LIST_03/GHG_LIST_03_01_VIEW";

    /**
     * 한전 전력사용량 API 호출 및 저장
     */
    @CircuitBreaker(name = "externalApi", fallbackMethod = "kepcoFallback")
    @Transactional
    public void fetchAndSaveKepcoPowerData(String year, String month) {
        log.info("Fetching KEPCO power data for {}/{}", year, month);

        if (kepcoKey == null || kepcoKey.trim().isEmpty() || "dummy-key".equals(kepcoKey)) {
            log.warn("KEPCO API Key is missing. Activating Fallback for {}/{}", year, month);
            generateFallbackData(year, month, EnergyType.ELECTRICITY);
            return;
        }

        try {
            String uri = KEPCO_API_URL + "?apiKey=" + kepcoKey + "&year=" + year + "&month=" + month + "&metroCd=11&returnType=json";

            String jsonResponse = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10)) // 타임아웃 10초 설정
                    .block();

            boolean dataLoaded = false;
            if (jsonResponse != null) {
                EnergyDto.KepcoPowerResponse response = objectMapper.readValue(jsonResponse, EnergyDto.KepcoPowerResponse.class);

                if (response.data() != null && !response.data().isEmpty()) {
                    for (EnergyDto.KepcoDataItem item : response.data()) {
                        String regionCode = item.metro() + " " + item.city(); // 예: 서울특별시 중구
                        String yearMonth = item.year() + "-" + item.month(); // YYYY-MM
                        Double powerUsage = item.powerUsage() != null ? item.powerUsage() : 0.0;
                        Double carbonEmission = powerUsage * 0.4781; // 전력 배출계수 기준 환산

                        saveOrUpdateData(regionCode, yearMonth, EnergyType.ELECTRICITY, powerUsage, "kWh", carbonEmission, "KEPCO Open API");
                        dataLoaded = true;
                    }
                }
            }

            if (!dataLoaded) {
                log.warn("KEPCO API returned empty data. Activating Fallback for {}/{}", year, month);
                generateFallbackData(year, month, EnergyType.ELECTRICITY);
            }
        } catch (Exception e) {
            throw new RuntimeException("KEPCO API fetch failed", e);
        }
    }

    public void kepcoFallback(String year, String month, Throwable t) {
        log.error("KEPCO API fetch failed (Circuit Breaker Triggered): {}. Activating Fallback for {}/{}", t.getMessage(), year, month);
        generateFallbackData(year, month, EnergyType.ELECTRICITY);
    }

    /**
     * 환경공단 온실가스 배출량 API 호출 및 저장
     */
    @CircuitBreaker(name = "externalApi", fallbackMethod = "kecoFallback")
    @Transactional
    public void fetchAndSaveKecoCarbonData(String year) {
        log.info("Fetching KECO carbon data for {}", year);

        if (kecoKey == null || kecoKey.trim().isEmpty() || "dummy-key".equals(kecoKey)) {
            log.warn("KECO API Key is missing. Activating Fallback for {}", year);
            generateFallbackData(year, "01", EnergyType.GAS);
            return;
        }

        try {
            String uri = KECO_API_URL + "?serviceKey=" + kecoKey + "&pageNo=1&numOfRows=100&apiType=JSON&q1=" + year;

            String jsonResponse = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            boolean dataLoaded = false;
            if (jsonResponse != null) {
                EnergyDto.KecoCarbonResponse response = objectMapper.readValue(jsonResponse, EnergyDto.KecoCarbonResponse.class);

                if (response.opentable() != null && response.opentable().row() != null) {
                    for (EnergyDto.KecoItem item : response.opentable().row()) {
                        String regionCode = item.tobDivisionName() != null ? item.tobDivisionName() : "DEFAULT_REGION";
                        String yearMonth = item.targetYear() + "-01";
                        Double emission = item.usemsQuantity() != null ? item.usemsQuantity() : 0.0;

                        // 온실가스 배출량 API는 가스 및 난방 등의 간접 배출량 중심이므로 GAS 타입으로 임의 적재
                        saveOrUpdateData(regionCode, yearMonth, EnergyType.GAS, 0.0, "m3", emission, "KECO Open API");
                        dataLoaded = true;
                    }
                }
            }

            if (!dataLoaded) {
                log.warn("KECO API returned empty data. Activating Fallback for {}", year);
                generateFallbackData(year, "01", EnergyType.GAS);
            }
        } catch (Exception e) {
            throw new RuntimeException("KECO API fetch failed", e);
        }
    }

    public void kecoFallback(String year, Throwable t) {
        log.error("KECO API fetch failed (Circuit Breaker Triggered): {}. Activating Fallback for {}", t.getMessage(), year);
        generateFallbackData(year, "01", EnergyType.GAS);
    }

    /**
     * Fallback 데이터 생성 로직
     * 계절 가중치 및 지역별 편차 난수를 활용하여 시뮬레이션 데이터를 적재합니다.
     */
    @Transactional
    public void generateFallbackData(String year, String month, EnergyType energyType) {
        log.info("Generating fallback data for {}/{} (Type: {})", year, month, energyType);
        String yearMonth = year + "-" + month;

        String[] regions = {"서울특별시 중구", "서울특별시 강남구", "경기도 수원시"};
        double[] baseAmounts = (energyType == EnergyType.ELECTRICITY) 
                ? new double[]{230.0, 270.0, 250.0} 
                : new double[]{150.0, 190.0, 170.0};

        int m = Integer.parseInt(month);
        double factor;

        if (energyType == EnergyType.ELECTRICITY) {
            // 전력 계절성: 여름(7,8) 및 겨울(1,12)에 전력 소비 증가
            switch (m) {
                case 7: factor = 1.30; break;
                case 8: factor = 1.35; break;
                case 1: factor = 1.25; break;
                case 12: factor = 1.20; break;
                case 2: factor = 1.15; break;
                case 3: case 6: case 11: factor = 0.95; break;
                case 9: factor = 0.90; break;
                case 4: factor = 0.85; break;
                case 5: case 10: factor = 0.80; break;
                default: factor = 1.0;
            }
        } else {
            // 가스 계절성: 난방 소비로 인해 겨울(12,1,2)에 압도적으로 높고, 여름(7,8)에는 매우 낮음
            switch (m) {
                case 1: factor = 1.60; break;
                case 2: factor = 1.50; break;
                case 12: factor = 1.40; break;
                case 3: factor = 1.10; break;
                case 11: factor = 1.00; break;
                case 4: factor = 0.80; break;
                case 10: factor = 0.70; break;
                case 5: factor = 0.50; break;
                case 6: case 9: factor = 0.40; break;
                case 7: case 8: factor = 0.25; break;
                default: factor = 1.0;
            }
        }

        // 연도 및 월 기반 고정 시드를 사용하여 안정적인 난수 생성
        long seed = Long.parseLong(year + month) + energyType.hashCode();
        Random random = new Random(seed);

        for (int i = 0; i < regions.length; i++) {
            double randomOffset = 0.97 + (0.06 * random.nextDouble());
            double calculatedAmount = baseAmounts[i] * factor * randomOffset;
            
            double usageAmount = Math.round(calculatedAmount * 100.0) / 100.0;
            double carbonEmission;
            String unit;

            if (energyType == EnergyType.ELECTRICITY) {
                carbonEmission = usageAmount * 0.4781;
                unit = "kWh";
            } else {
                carbonEmission = usageAmount * 2.22; // 가스 배출계수 기준 임의 환산
                unit = "m3";
            }

            saveOrUpdateData(regions[i], yearMonth, energyType, usageAmount, unit, carbonEmission, "Fallback System");
        }
    }

    private void saveOrUpdateData(String regionCode, String yearMonth, EnergyType energyType, 
                                  Double usageAmount, String usageUnit, Double carbonEmission, String sourceName) {
        Optional<EnergyUsage> existingData = energyUsageRepository
                .findByRegionCodeAndUsageYearMonthAndEnergyType(regionCode, yearMonth, energyType);

        BigDecimal bdUsageAmount = usageAmount != null ? BigDecimal.valueOf(usageAmount) : null;
        BigDecimal bdCarbonEmission = carbonEmission != null ? BigDecimal.valueOf(carbonEmission) : null;

        if (existingData.isPresent()) {
            EnergyUsage data = existingData.get();
            EnergyUsage updated = EnergyUsage.builder()
                    .id(data.getId())
                    .regionId(data.getRegionId())
                    .regionCode(regionCode)
                    .usageYearMonth(yearMonth)
                    .energyType(energyType)
                    .usageAmount(bdUsageAmount)
                    .usageUnit(usageUnit)
                    .carbonEmissionKg(bdCarbonEmission)
                    .sourceName(sourceName)
                    .build();
            energyUsageRepository.save(updated);
        } else {
            EnergyUsage newData = EnergyUsage.builder()
                    .regionCode(regionCode)
                    .usageYearMonth(yearMonth)
                    .energyType(energyType)
                    .usageAmount(bdUsageAmount)
                    .usageUnit(usageUnit)
                    .carbonEmissionKg(bdCarbonEmission)
                    .sourceName(sourceName)
                    .build();
            energyUsageRepository.save(newData);
        }
    }

    /**
     * 임의 지역 코드(regionCode) 및 연도에 대하여 12개월분 가상 시뮬레이션 데이터를 실시간 생성 및 적재합니다.
     */
    @Transactional
    public void generateFallbackDataForRegionAndYear(String regionCode, String year) {
        log.info("Generating dynamic simulation data for regionCode: {}, year: {}", regionCode, year);
        
        long seed = regionCode.hashCode() + year.hashCode();
        Random random = new Random(seed);
        
        // 지역 해시코드 기반의 결정론적 기본량 계산
        double basePower = 230.0 + (Math.abs(regionCode.hashCode()) % 50);
        double baseGas = 150.0 + (Math.abs(regionCode.hashCode()) % 40);
        
        for (int m = 1; m <= 12; m++) {
            String month = m < 10 ? "0" + m : String.valueOf(m);
<<<<<<< HEAD
            String yearMonth = year + "-" + month;
=======
            String yearMonth = year + month;
>>>>>>> feature/community-fe-setup
            
            // ELECTRICITY 계절 가중치 및 난수화
            double powerFactor;
            switch (m) {
                case 7: powerFactor = 1.30; break;
                case 8: powerFactor = 1.35; break;
                case 1: powerFactor = 1.25; break;
                case 12: powerFactor = 1.20; break;
                case 2: powerFactor = 1.15; break;
                case 3: case 6: case 11: powerFactor = 0.95; break;
                case 9: powerFactor = 0.90; break;
                case 4: powerFactor = 0.85; break;
                case 5: case 10: powerFactor = 0.80; break;
                default: powerFactor = 1.0;
            }
            double powerOffset = 0.97 + (0.06 * random.nextDouble());
            double powerUsage = Math.round(basePower * powerFactor * powerOffset * 100.0) / 100.0;
            double powerCarbon = Math.round(powerUsage * 0.4781 * 100.0) / 100.0;
            saveOrUpdateData(regionCode, yearMonth, EnergyType.ELECTRICITY, powerUsage, "kWh", powerCarbon, "Fallback Seeding");
            
            // GAS 계절 가중치 및 난수화
            double gasFactor;
            switch (m) {
                case 1: gasFactor = 1.60; break;
                case 2: gasFactor = 1.50; break;
                case 12: gasFactor = 1.40; break;
                case 3: gasFactor = 1.10; break;
                case 11: gasFactor = 1.00; break;
                case 4: gasFactor = 0.80; break;
                case 10: gasFactor = 0.70; break;
                case 5: gasFactor = 0.50; break;
                case 6: case 9: gasFactor = 0.40; break;
                case 7: case 8: gasFactor = 0.25; break;
                default: gasFactor = 1.0;
            }
            double gasOffset = 0.97 + (0.06 * random.nextDouble());
            double gasUsage = Math.round(baseGas * gasFactor * gasOffset * 100.0) / 100.0;
            double gasCarbon = Math.round(gasUsage * 2.22 * 100.0) / 100.0;
            saveOrUpdateData(regionCode, yearMonth, EnergyType.GAS, gasUsage, "m3", gasCarbon, "Fallback Seeding");
        }
    }
}
