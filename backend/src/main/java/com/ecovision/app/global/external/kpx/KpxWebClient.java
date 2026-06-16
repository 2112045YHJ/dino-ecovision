package com.ecovision.app.global.external.kpx;

import com.ecovision.app.domain.world.entity.CarbonIntensityLog;
import com.ecovision.app.domain.world.repository.CarbonIntensityLogRepository;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Component
@Slf4j
public class KpxWebClient {

    private final WebClient webClient;
    private final CarbonIntensityLogRepository carbonIntensityLogRepository;
    private final Random random = new Random();

    @Value("${kpx.mock-mode:false}")
    private boolean mockMode;

    @Value("${kpx.api-key:dummy-key}")
    private String apiKey;

    public KpxWebClient(CarbonIntensityLogRepository carbonIntensityLogRepository) {
        this.carbonIntensityLogRepository = carbonIntensityLogRepository;

        // WebClient HttpClient 구성 (Connection Timeout 3초, Read Timeout 5초)
        ConnectionProvider provider = ConnectionProvider.builder("kpx-connection-provider")
                .maxConnections(50)
                .pendingAcquireTimeout(Duration.ofSeconds(10))
                .build();

        HttpClient httpClient = HttpClient.create(provider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3000)
                .responseTimeout(Duration.ofSeconds(5))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(5))
                        .addHandlerLast(new WriteTimeoutHandler(5)));

        this.webClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl("https://api.kpx.or.kr") // KPX API Base URL (가정)
                .build();
    }

    /**
     * 실시간 전력 예비율을 수집합니다.
     * 
     * @return 전력 예비율 (%)
     */
    public double getReserveRate() {
        // 1. 모의(Mock) 모드 활성화 시 8% ~ 18% 범위의 난수 반환
        if (mockMode) {
            double mockRate = 8.0 + (random.nextDouble() * 10.0);
            log.info("[KPX MOCK MODE ACTIVE] Generated mock reserve rate: {}%", String.format("%.2f", mockRate));
            return mockRate;
        }

        try {
            log.info("[KPX API CALL] Fetching real-time electricity reserve rate...");
            
            // 2. 외부 API 호출 및 3회 재시도 정책 적용
            Map<?, ?> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/power/reserve")
                            .queryParam("serviceKey", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                            .doBeforeRetry(retrySignal -> log.warn("[KPX API RETRY] Retrying due to failure. Count: {}", retrySignal.totalRetries() + 1)))
                    .block(Duration.ofSeconds(10)); // 최대 10초 대기

            if (response != null && response.containsKey("reserveRate")) {
                double reserveRate = Double.parseDouble(response.get("reserveRate").toString());
                log.info("[KPX API SUCCESS] Retrieved reserve rate: {}%", reserveRate);
                return reserveRate;
            }
            throw new RuntimeException("Empty response or missing reserveRate field");

        } catch (Exception e) {
            log.error("[KPX API ERROR] Failed to fetch real-time power reserve rate: {}. Triggering Database Fallback...", e.getMessage());
            
            // 3. 외부 API 에러 시 DB Fallback 기동 (최근 1시간 내 데이터)
            LocalDateTime timeLimit = LocalDateTime.now().minusHours(1);
            return carbonIntensityLogRepository.findLatestLogWithinHour(timeLimit)
                    .map(logEntry -> {
                        double dbRate = logEntry.getReserveRate().doubleValue();
                        log.info("[KPX FALLBACK SUCCESS] Using latest database log value from {}: {}%", logEntry.getMeasuredAt(), dbRate);
                        return dbRate;
                    })
                    .orElseGet(() -> {
                        // 최후의 보루: DB에 기록조차 없으면 디폴트 값 15% 반환
                        log.warn("[KPX FALLBACK WARNING] No database logs found within the last hour. Using absolute default reserve rate: 15.0%");
                        return 15.0;
                    });
        }
    }
}
