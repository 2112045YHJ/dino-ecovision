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
            log.warn("KEPCO API Key is missing. Skipping data fetch for {}/{}", year, month);
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
                        String yearMonth = item.year() + item.month(); // YYYYMM
                        Double powerUsage = item.powerUsage() != null ? item.powerUsage() : 0.0;
                        Double carbonEmission = powerUsage * 0.4781; // 전력 배출계수 기준 환산

                        saveOrUpdateData(regionCode, yearMonth, EnergyType.ELECTRICITY, powerUsage, "kWh", carbonEmission, "KEPCO Open API");
                        dataLoaded = true;
                    }
                }
            }

            if (!dataLoaded) {
                log.warn("KEPCO API returned empty data for {}/{}", year, month);
            }
        } catch (Exception e) {
            throw new RuntimeException("KEPCO API fetch failed", e);
        }
    }

    public void kepcoFallback(String year, String month, Throwable t) {
        log.error("KEPCO API fetch failed (Circuit Breaker Triggered) for {}/{}: {}", year, month, t.getMessage());
    }

    /**
     * 환경공단 온실가스 배출량 API 호출 및 저장
     */
    @CircuitBreaker(name = "externalApi", fallbackMethod = "kecoFallback")
    @Transactional
    public void fetchAndSaveKecoCarbonData(String year) {
        log.info("Fetching KECO carbon data for {}", year);

        if (kecoKey == null || kecoKey.trim().isEmpty() || "dummy-key".equals(kecoKey)) {
            log.warn("KECO API Key is missing. Skipping data fetch for {}", year);
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
                        String yearMonth = item.targetYear() + "01"; // YYYYMM
                        Double emission = item.usemsQuantity() != null ? item.usemsQuantity() : 0.0;

                        // 온실가스 배출량 API는 가스 및 난방 등의 간접 배출량 중심이므로 GAS 타입으로 임의 적재
                        saveOrUpdateData(regionCode, yearMonth, EnergyType.GAS, 0.0, "m3", emission, "KECO Open API");
                        dataLoaded = true;
                    }
                }
            }

            if (!dataLoaded) {
                log.warn("KECO API returned empty data for {}", year);
            }
        } catch (Exception e) {
            throw new RuntimeException("KECO API fetch failed", e);
        }
    }

    public void kecoFallback(String year, Throwable t) {
        log.error("KECO API fetch failed (Circuit Breaker Triggered) for {}: {}", year, t.getMessage());
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
     * API 키 등록 상태 반환
     */
    public String getKeyStatus() {
        boolean isKepcoMissing = (kepcoKey == null || kepcoKey.trim().isEmpty() || "dummy-key".equals(kepcoKey));
        boolean isKecoMissing = (kecoKey == null || kecoKey.trim().isEmpty() || "dummy-key".equals(kecoKey));
        
        if (isKepcoMissing && isKecoMissing) {
            return "BOTH_MISSING";
        } else if (isKepcoMissing) {
            return "KEPCO_MISSING";
        } else if (isKecoMissing) {
            return "KECO_MISSING";
        }
        return "ALL_OK";
    }

    /**
     * 개발용 모의 데이터 강제 적재 (API 키가 없을 때 로컬 테스트용)
     */
    @Transactional
    public void generateFallbackDataForRegionAndYear(String regionCode, String year) {
        log.info("Generating mock data for region: {}, year: {}", regionCode, year);
        Random random = new Random();
        
        // 1월부터 12월까지 (2026년은 현재 6월까지만)
        int endMonth = "2026".equals(year) ? 6 : 12;
        
        for (int m = 1; m <= endMonth; m++) {
            String month = String.format("%02d", m);
            String yearMonth = year + month; // YYYYMM
            
            // 전력 데이터 생성
            double basePower = 300.0 + random.nextDouble() * 100.0;
            // 겨울철(12, 1, 2) 및 여름철(7, 8) 사용량 보정
            if (m == 12 || m == 1 || m == 2) basePower += 80.0;
            if (m == 7 || m == 8) basePower += 120.0;
            
            double powerCarbon = basePower * 0.4781;
            saveOrUpdateData(regionCode, yearMonth, EnergyType.ELECTRICITY, basePower, "kWh", powerCarbon, "Mock Data Creator");
            
            // 가스 데이터 생성
            double baseGas = 50.0 + random.nextDouble() * 30.0;
            if (m == 12 || m == 1 || m == 2) baseGas += 100.0; // 겨울 난방
            
            double gasCarbon = baseGas * 2.176; // 가스 배출계수 기준 환산
            saveOrUpdateData(regionCode, yearMonth, EnergyType.GAS, baseGas, "m3", gasCarbon, "Mock Data Creator");
        }
    }
}
