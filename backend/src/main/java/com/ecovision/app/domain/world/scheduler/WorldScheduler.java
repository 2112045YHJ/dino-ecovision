package com.ecovision.app.domain.world.scheduler;

import com.ecovision.app.domain.world.entity.CarbonIntensityLog;
import com.ecovision.app.domain.world.repository.CarbonIntensityLogRepository;
import com.ecovision.app.global.external.kpx.KpxWebClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorldScheduler {

    private final KpxWebClient kpxWebClient;
    private final CarbonIntensityLogRepository carbonIntensityLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * 5분 주기로 실시간 전력 및 탄소 데이터를 수집하여 적재합니다.
     * Cron: "0 * / 5 * * * *" (매 5분마다 0초에 실행)
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void collectCarbonIntensity() {
        log.info("[WORLD SCHEDULER START] Initiating 5-minute carbon intensity log collection...");

        try {
            // 1. KPX로부터 실시간 전력 예비율 획득
            double reserveRate = kpxWebClient.getReserveRate();

            // 2. 예비율에 반비례하는 탄소집약도 시뮬레이션 계산 (피크 부하 시 화력 발전 비중 상승 반영)
            // 공식: 600 - (예비율 * 15.0) -> 예: 예비율 10% 일 시 450 gCO2/kWh
            double simulatedIntensity = 600.0 - (reserveRate * 15.0);
            
            // 안전 클램핑 (100 ~ 800 gCO2/kWh)
            if (simulatedIntensity < 100.0) simulatedIntensity = 100.0;
            if (simulatedIntensity > 800.0) simulatedIntensity = 800.0;

            BigDecimal carbonIntensity = BigDecimal.valueOf(simulatedIntensity).setScale(3, RoundingMode.HALF_UP);

            // 3. 탄소집약도에 따른 상태 및 가중치 계산
            String status;
            double weight;

            if (simulatedIntensity < 300.0) {
                status = "PURIFIED";
                weight = 1.0;
            } else if (simulatedIntensity <= 500.0) {
                status = "NORMAL";
                weight = 1.2;
            } else {
                status = "POLLUTED";
                weight = 1.5;
            }

            BigDecimal carbonWeight = BigDecimal.valueOf(weight).setScale(2, RoundingMode.HALF_UP);

            // 4. 동적 발전원 비중(Power Mix) JSON 생성
            // 탄소집약도가 높을수록 석탄 발전 비중이 증가하도록 시뮬레이션
            double coalRatio = (simulatedIntensity / 1000.0) * 0.6; // 최대 48%
            double gasRatio = 0.25;
            double nuclearRatio = 0.20;
            double renewableRatio = 1.0 - (coalRatio + gasRatio + nuclearRatio);
            if (renewableRatio < 0) renewableRatio = 0.0;

            List<Map<String, Object>> powerMixList = List.of(
                    Map.of("source", "석탄", "ratio", Math.round(coalRatio * 100) / 100.0),
                    Map.of("source", "가스", "ratio", gasRatio),
                    Map.of("source", "원자력", "ratio", nuclearRatio),
                    Map.of("source", "신재생", "ratio", Math.round(renewableRatio * 100) / 100.0)
            );

            String powerMixJson = objectMapper.writeValueAsString(powerMixList);

            // 5. 엔티티 생성 및 저장
            CarbonIntensityLog logEntry = CarbonIntensityLog.builder()
                    .measuredAt(LocalDateTime.now())
                    .carbonIntensity(carbonIntensity)
                    .status(status)
                    .carbonWeight(carbonWeight)
                    .reserveRate(BigDecimal.valueOf(reserveRate).setScale(2, RoundingMode.HALF_UP))
                    .powerMixJson(powerMixJson)
                    .source(mockModeActive() ? "KPX_MOCK" : "KPX")
                    .build();

            carbonIntensityLogRepository.save(logEntry);

            log.info("[WORLD SCHEDULER SUCCESS] Saved carbon intensity log. Rate: {}%, Intensity: {}, Status: {} (x{}), Mix: {}", 
                    reserveRate, carbonIntensity, status, weight, powerMixJson);

        } catch (Exception e) {
            log.error("[WORLD SCHEDULER ERROR] Failed to collect and save carbon intensity log: {}", e.getMessage(), e);
        }
    }

    private boolean mockModeActive() {
        try {
            // 리플렉션이나 필드를 통해 mockMode를 우회적으로 파악하거나, 단순 true/false 로깅용
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
