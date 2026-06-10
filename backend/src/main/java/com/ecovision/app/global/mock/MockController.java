package com.ecovision.app.global.mock;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Slf4j
public class MockController {

    private Map<String, Object> buildApiResponse(boolean success, Object data, Object error) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("data", data);
        response.put("error", error);
        return response;
    }

    /**
     * 1.1 회원가입 MOCK API
     */
    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "unknown@ecovision.com");
        log.info("[MOCK SIGNUP] Request received for email: {}", email);

        Map<String, Object> data = Map.of(
                "userId", 101,
                "email", email,
                "onboardingRequired", true
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(buildApiResponse(true, data, null));
    }

    /**
     * 1.2 로그인 MOCK API
     */
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "unknown@ecovision.com");
        log.info("[MOCK LOGIN] Request received for email: {}", email);

        if (email.contains("fail")) {
            // 이메일에 'fail' 단어가 포함된 경우 실패 Mocking 테스트 지원
            Map<String, Object> errorDetails = Map.of(
                    "code", "LOGIN_FAILED",
                    "message", "이메일 또는 비밀번호가 올바르지 않습니다.",
                    "details", List.of()
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(buildApiResponse(false, null, errorDetails));
        }

        Map<String, Object> data = Map.of(
                "accessToken", "mock-jwt-token-xyz-123456",
                "onboardingRequired", false,
                "role", "USER"
        );

        return ResponseEntity.ok(buildApiResponse(true, data, null));
    }

    /**
     * 2.1 내 프로필 조회 MOCK API
     */
    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        log.info("[MOCK PROFILE] Fetching mock profile...");

        Map<String, Object> data = Map.of(
                "userId", 101,
                "email", "green@ecovision.com",
                "nickname", "에코시티즌",
                "regionCode", "2635051000",
                "regionName", "부산광역시 해운대구 우동",
                "totalPoints", 3420,
                "rankingPoint", 340,
                "savedCarbonKg", 74.320,
                "role", "USER",
                "onboardingRequired", false
        );

        return ResponseEntity.ok(buildApiResponse(true, data, null));
    }

    /**
     * 6.1 활성 던전 조회 MOCK API
     */
    @GetMapping("/dungeons/active")
    public ResponseEntity<?> getActiveDungeon() {
        log.info("[MOCK DUNGEON] Checking mock active dungeon...");

        LocalDateTime now = LocalDateTime.now();
        String startedAt = now.minusMinutes(25).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        String endedAt = now.plusMinutes(35).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        Map<String, Object> data = Map.of(
                "dungeonId", 12,
                "status", "ACTIVE",
                "reserveRate", 8.45,
                "dungeonMultiplier", 2.00,
                "startedAt", startedAt,
                "endedAt", endedAt,
                "title", "전력 공급 예비율 비상! 탄소 절감 피크 던전 발령",
                "carbonIntensity", 520.300
        );

        return ResponseEntity.ok(buildApiResponse(true, data, null));
    }
}
