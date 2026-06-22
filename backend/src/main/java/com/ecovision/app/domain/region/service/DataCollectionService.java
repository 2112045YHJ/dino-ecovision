package com.ecovision.app.domain.region.service;

import com.ecovision.app.domain.region.dto.EnergyDto;
import com.ecovision.app.domain.region.entity.EnergyType;
import com.ecovision.app.domain.region.entity.EnergyUsage;
import com.ecovision.app.domain.region.entity.IndustrialEnergyUsage;
import com.ecovision.app.domain.region.repository.EnergyUsageRepository;
import com.ecovision.app.domain.region.repository.IndustrialEnergyUsageRepository;
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
    private final IndustrialEnergyUsageRepository industrialEnergyUsageRepository;
    private final ObjectMapper objectMapper;
    private final WebClient webClient = WebClient.builder().build();

    @Value("${openapi.kepco-key:dummy-key}")
    private String kepcoKey;

    @Value("${openapi.keco-key:dummy-key}")
    private String kecoKey;

    @Value("${openapi.kea-key:${openapi.keco-key}}")
    private String keaKey;

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

            if (jsonResponse != null && (jsonResponse.trim().startsWith("<") || jsonResponse.trim().startsWith("<?xml"))) {
                log.error("KEPCO API returned XML instead of JSON. Response: {}", jsonResponse);
                throw new RuntimeException("KEPCO API returned XML error");
            }

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

            if (jsonResponse != null && (jsonResponse.trim().startsWith("<") || jsonResponse.trim().startsWith("<?xml"))) {
                log.error("KECO API returned XML instead of JSON. Response: {}", jsonResponse);
                throw new RuntimeException("KECO API returned XML error");
            }

            boolean dataLoaded = false;
            if (jsonResponse != null) {
                EnergyDto.KecoCarbonResponse response = objectMapper.readValue(jsonResponse, EnergyDto.KecoCarbonResponse.class);

                if (response.opentable() != null && response.opentable().row() != null) {
                    for (EnergyDto.KecoItem item : response.opentable().row()) {
                        String rawRegion = item.localDivisionName();
                        if (rawRegion == null || rawRegion.trim().isEmpty()) {
                            rawRegion = item.tobDivisionName();
                        }
                        String regionCode = normalizeRegionName(rawRegion);
                        String yearMonth = item.targetYear() + "01"; // YYYYMM
                        Double emission = item.usemsQuantity() != null ? item.usemsQuantity() : 0.0;
                        Double usageAmount = 0.0;
                        if (emission > 0.0) {
                            usageAmount = emission / 2.176;
                        }

                        // 온실가스 배출량 API는 가스 및 난방 등의 간접 배출량 중심이므로 GAS 타입으로 임의 적재
                        saveOrUpdateData(regionCode, yearMonth, EnergyType.GAS, usageAmount, "m3", emission, "KECO Open API");
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
        boolean isKeaMissing = (keaKey == null || keaKey.trim().isEmpty() || "dummy-key".equals(keaKey));
        
        if (isKepcoMissing && isKecoMissing && isKeaMissing) {
            return "ALL_MISSING";
        } else if (isKepcoMissing) {
            return "KEPCO_MISSING";
        } else if (isKecoMissing) {
            return "KECO_MISSING";
        } else if (isKeaMissing) {
            return "KEA_MISSING";
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

    /**
     * 한국에너지공단 산업부문 통계 API 호출 및 저장
     */
    @CircuitBreaker(name = "externalApi", fallbackMethod = "keaFallback")
    @Transactional
    public void fetchAndSaveKeaIndustrialData(String year) {
        log.info("Fetching KEA industrial data for {}", year);

        if (keaKey == null || keaKey.trim().isEmpty() || "dummy-key".equals(keaKey)) {
            log.warn("KEA API Key is missing. Skipping data fetch for {}", year);
            return;
        }

        try {
            String uri = "http://apis.data.go.kr/B553530/GHG_LIST_01/GHG_LIST_01_03_VIEW"
                    + "?ServiceKey=" + keaKey 
                    + "&pageNo=1&numOfRows=100&apiType=JSON&q1=" + year;

            String jsonResponse = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (jsonResponse != null && (jsonResponse.trim().startsWith("<") || jsonResponse.trim().startsWith("<?xml"))) {
                log.error("KEA API returned XML instead of JSON. Response: {}", jsonResponse);
                throw new RuntimeException("KEA API returned XML error");
            }

            boolean dataLoaded = false;
            if (jsonResponse != null) {
                EnergyDto.KeaIndustrialResponse response = objectMapper.readValue(jsonResponse, EnergyDto.KeaIndustrialResponse.class);

                if (response.opentable() != null && response.opentable().row() != null) {
                    for (EnergyDto.KeaItem item : response.opentable().row()) {
                        String rawRegion = item.localDivisionName();
                        if (rawRegion == null || rawRegion.trim().isEmpty()) {
                            rawRegion = item.localDivisionName(); // Fallback check
                        }
                        String regionCode = normalizeRegionName(rawRegion);
                        String targetYear = item.targetYear();
                        String industryCode = item.ksicCode() != null ? item.ksicCode() : "UNKNOWN";
                        String dataDivisionCode = item.dataDivisionCode() != null ? item.dataDivisionCode() : "UNKNOWN";
                        String energySourceName = item.energySourceName() != null ? item.energySourceName() : "UNKNOWN";
                        String unitName = item.unitName() != null ? item.unitName() : "";
                        
                        String rawAmount = item.usemsQuantityNidval();
                        Double amount = 0.0;
                        if (rawAmount != null && !rawAmount.trim().equals("-")) {
                            try {
                                amount = Double.parseDouble(rawAmount.trim());
                            } catch (NumberFormatException e) {
                                log.warn("Failed to parse KEA usemsQuantityNidval: {}", rawAmount);
                            }
                        }

                        saveOrUpdateIndustrialData(targetYear, industryCode, dataDivisionCode, energySourceName, regionCode, amount, unitName);
                        dataLoaded = true;
                    }
                }
            }

            if (!dataLoaded) {
                log.warn("KEA API returned empty data for {}", year);
            }
        } catch (Exception e) {
            throw new RuntimeException("KEA API fetch failed", e);
        }
    }

    public void keaFallback(String year, Throwable t) {
        log.error("KEA API fetch failed (Circuit Breaker Triggered) for {}: {}", year, t.getMessage());
    }

    private void saveOrUpdateIndustrialData(String targetYear, String industryCode, String dataDivisionCode, 
                                            String energySourceName, String regionCode, Double amount, String unitName) {
        Optional<IndustrialEnergyUsage> existingData = industrialEnergyUsageRepository
                .findByTargetYearAndIndustryCodeAndDataDivisionCodeAndEnergySourceNameAndRegionCode(
                        targetYear, industryCode, dataDivisionCode, energySourceName, regionCode);

        BigDecimal bdAmount = amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO;

        if (existingData.isPresent()) {
            IndustrialEnergyUsage data = existingData.get();
            IndustrialEnergyUsage updated = IndustrialEnergyUsage.builder()
                    .id(data.getId())
                    .targetYear(targetYear)
                    .industryCode(industryCode)
                    .dataDivisionCode(dataDivisionCode)
                    .energySourceName(energySourceName)
                    .regionCode(regionCode)
                    .usageAmount(bdAmount)
                    .unitName(unitName)
                    .build();
            industrialEnergyUsageRepository.save(updated);
        } else {
            IndustrialEnergyUsage newData = IndustrialEnergyUsage.builder()
                    .targetYear(targetYear)
                    .industryCode(industryCode)
                    .dataDivisionCode(dataDivisionCode)
                    .energySourceName(energySourceName)
                    .regionCode(regionCode)
                    .usageAmount(bdAmount)
                    .unitName(unitName)
                    .build();
            industrialEnergyUsageRepository.save(newData);
        }
    }

    private String normalizeRegionName(String rawRegion) {
        if (rawRegion == null || rawRegion.trim().isEmpty()) {
            return "DEFAULT_REGION";
        }
        String cleaned = rawRegion.trim().replaceAll("\\s+", " ");
        String[] parts = cleaned.split(" ");
        if (parts.length == 0) {
            return "DEFAULT_REGION";
        }
        
        String metro = parts[0];
        String normalizedMetro = switch (metro) {
            case "서울", "서울특별시" -> "서울특별시";
            case "부산", "부산광역시" -> "부산광역시";
            case "대구", "대구광역시" -> "대구광역시";
            case "인천", "인천광역시" -> "인천광역시";
            case "광주", "광주광역시" -> "광주광역시";
            case "대전", "대전광역시" -> "대전광역시";
            case "울산", "울산광역시" -> "울산광역시";
            case "세종", "세종시", "세종특별자치시" -> "세종특별자치시";
            case "경기", "경기도" -> "경기도";
            case "강원", "강원도", "강원특별자치도" -> "강원특별자치도";
            case "충북", "충청북도" -> "충청북도";
            case "충남", "충청남도" -> "충청남도";
            case "전북", "전라북도" -> "전라북도";
            case "전남", "전라남도" -> "전라남도";
            case "경북", "경상북도" -> "경상북도";
            case "경남", "경상남도" -> "경상남도";
            case "제주", "제주도", "제주특별자치도" -> "제주특별자치도";
            default -> metro;
        };
        
        if (parts.length > 1) {
            StringBuilder sb = new StringBuilder(normalizedMetro);
            for (int i = 1; i < parts.length; i++) {
                sb.append(" ").append(parts[i]);
            }
            return sb.toString();
        }
        return normalizedMetro;
    }
}
