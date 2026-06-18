package com.ecovision.app.domain.world.controller;

import com.ecovision.app.domain.dungeon.repository.DungeonEventRepository;
import com.ecovision.app.domain.world.entity.CarbonIntensityLog;
import com.ecovision.app.domain.world.repository.CarbonIntensityLogRepository;
import com.ecovision.app.global.response.ApiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/world")
@RequiredArgsConstructor
@Slf4j
public class WorldController {

    private final CarbonIntensityLogRepository carbonIntensityLogRepository;
    private final DungeonEventRepository dungeonEventRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<WorldStatusResponse>> getCurrentWorld() {
        // 1. 최신 탄소 집약도 로그 조회
        CarbonIntensityLog latestLog = carbonIntensityLogRepository.findFirstByOrderByMeasuredAtDesc()
                .orElse(null);

        // 2. 던전 활성화 여부 조회
        boolean dungeonActive = dungeonEventRepository.findFirstByStatusOrderByStartedAtDesc("ACTIVE").isPresent();

        if (latestLog == null) {
            // fallback 데이터 제공
            WorldStatusResponse fallbackResponse = WorldStatusResponse.builder()
                    .carbonIntensity(350.0)
                    .gradeStatus("NORMAL")
                    .carbonWeight(1.2)
                    .reserveRate(12.0)
                    .dungeonActive(dungeonActive)
                    .measuredAt(java.time.LocalDateTime.now().toString())
                    .isFallback(true)
                    .powerMix(Collections.emptyList())
                    .build();
            return ResponseEntity.ok(ApiResponse.success(fallbackResponse));
        }

        // Power Mix 파싱
        List<Map<String, Object>> powerMix = Collections.emptyList();
        if (latestLog.getPowerMixJson() != null) {
            try {
                powerMix = objectMapper.readValue(latestLog.getPowerMixJson(), new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                log.error("Failed to parse power mix json: {}", e.getMessage());
            }
        }

        WorldStatusResponse response = WorldStatusResponse.builder()
                .carbonIntensity(latestLog.getCarbonIntensity() != null ? latestLog.getCarbonIntensity().doubleValue() : 0.0)
                .gradeStatus(latestLog.getStatus())
                .carbonWeight(latestLog.getCarbonWeight() != null ? latestLog.getCarbonWeight().doubleValue() : 0.0)
                .reserveRate(latestLog.getReserveRate() != null ? latestLog.getReserveRate().doubleValue() : 0.0)
                .dungeonActive(dungeonActive)
                .measuredAt(latestLog.getMeasuredAt() != null ? latestLog.getMeasuredAt().toString() : "")
                .isFallback(false)
                .powerMix(powerMix)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Getter
    @Builder
    public static class WorldStatusResponse {
        private double carbonIntensity;
        private String gradeStatus;
        private double carbonWeight;
        private double reserveRate;
        private boolean dungeonActive;
        private String measuredAt;
        private boolean isFallback;
        private List<Map<String, Object>> powerMix;
    }
}
