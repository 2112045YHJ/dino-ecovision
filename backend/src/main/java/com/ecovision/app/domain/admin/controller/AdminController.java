package com.ecovision.app.domain.admin.controller;

import com.ecovision.app.domain.admin.dto.AdminDto;
import com.ecovision.app.domain.admin.entity.DataUploadLog;
import com.ecovision.app.domain.admin.repository.DataUploadLogRepository;
import com.ecovision.app.domain.admin.service.AdminService;
import com.ecovision.app.domain.dungeon.dto.DungeonDto;
import com.ecovision.app.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final JdbcTemplate jdbcTemplate;
    private final DataUploadLogRepository dataUploadLogRepository;
	private final AdminService adminService;
    
    /**
     * 공공 에너지 사용량 CSV 데이터를 벌크 적재합니다.
     * 
     * @param file          업로드할 CSV 파일
     * @param adminUserId   관리자 유저 ID (인증 완료 전 테스트용 헤더, 기본값 1)
     * @return 처리 결과 JSON
     */
    @PostMapping("/uploads")
    public ResponseEntity<?> uploadEnergyUsages(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-Admin-User-Id", defaultValue = "1") Long adminUserId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "업로드할 파일이 비어 있습니다."));
        }

        log.info("[ADMIN BULK UPLOAD START] Admin ID: {}, File Name: {}, File Size: {} bytes", 
                adminUserId, file.getOriginalFilename(), file.getSize());

        // 1. 초기 적재 로그 생성 및 DB 저장 (독립 트랜잭션처럼 동작하도록 먼저 저장)
        DataUploadLog uploadLog = DataUploadLog.builder()
                .adminUserId(adminUserId)
                .fileName(file.getOriginalFilename())
                .dataType("ENERGY_USAGE_CSV")
                .status("PROCESSING")
                .build();
        uploadLog = dataUploadLogRepository.saveAndFlush(uploadLog);

        try {
            // 2. 지역 매핑 정보(region_code -> id) 고속 조회를 위해 메모리에 캐싱
            Map<String, Long> regionMap = loadRegionMap();
            log.info("[ADMIN BULK UPLOAD] Pre-cached {} regions from database.", regionMap.size());

            // 3. 파일 파싱 및 벌크 적재 수행
            UploadResult result = processCsvFile(file, regionMap);

            // 4. 업로드 완료 성공 이력 업데이트
            uploadLog.setTotalRows(result.totalRows);
            uploadLog.setSuccessRows(result.successRows);
            uploadLog.setFailedRows(result.failedRows);
            uploadLog.setStatus("SUCCESS");
            dataUploadLogRepository.save(uploadLog);

            log.info("[ADMIN BULK UPLOAD SUCCESS] Completed successfully. Total: {}, Success: {}, Failed: {}", 
                    result.totalRows, result.successRows, result.failedRows);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "uploadId", uploadLog.getId(),
                    "totalRows", result.totalRows,
                    "successRows", result.successRows,
                    "failedRows", result.failedRows
            ));

        } catch (Exception e) {
            log.error("[ADMIN BULK UPLOAD FAILED] Critical error during bulk upload: {}", e.getMessage(), e);

            // 5. 예외 발생 시 로그 실패 마킹 및 상세 에러 메시지 기록
            uploadLog.setStatus("FAILED");
            uploadLog.setErrorMessage(e.getMessage() != null ? e.getMessage() : e.toString());
            dataUploadLogRepository.save(uploadLog);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "uploadId", uploadLog.getId(),
                    "message", "벌크 적재 도중 예외가 발생했습니다.",
                    "error", e.getMessage() != null ? e.getMessage() : e.toString()
            ));
        }
    }

    /**
     * regions 테이블 정보를 룩업용 메모리 맵으로 적재합니다.
     */
    private Map<String, Long> loadRegionMap() {
        String sql = "SELECT id, region_code FROM regions";
        Map<String, Long> regionMap = new HashMap<>();
        jdbcTemplate.query(sql, rs -> {
            regionMap.put(rs.getString("region_code"), rs.getLong("id"));
        });
        return regionMap;
    }

    /**
     * CSV 파일을 읽어서 1,000건 단위 Chunk로 벌크 적재를 진행합니다.
     */
    @Transactional
    protected UploadResult processCsvFile(MultipartFile file, Map<String, Long> regionMap) throws Exception {
        String insertSql = "INSERT INTO energy_usages " +
                "(region_id, region_code, usage_year_month, energy_type, usage_amount, usage_unit, carbon_emission_kg, source_name) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        int totalRows = 0;
        int successRows = 0;
        int failedRows = 0;

        List<Object[]> chunkBuffer = new ArrayList<>(1000);

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"))) {
            String line;
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false; // 첫 줄(헤더)은 건너뜁니다.
                    continue;
                }

                totalRows++;
                try {
                    // CSV 라인 분리 (쉼표 구분)
                    String[] tokens = line.split(",");
                    if (tokens.length < 7) {
                        throw new IllegalArgumentException("필드 개수가 부족합니다. (필요: 최소 7개, 현재: " + tokens.length + "개)");
                    }

                    // CSV 컬럼 매핑:
                    // tokens[0]: region_code
                    // tokens[1]: usage_year_month (YYYYMM)
                    // tokens[2]: energy_type (ELECTRICITY, GAS, WATER 등)
                    // tokens[3]: usage_amount (Decimal)
                    // tokens[4]: usage_unit (kWh, m3 등)
                    // tokens[5]: carbon_emission_kg (Decimal)
                    // tokens[6]: source_name (출처)

                    String regionCode = tokens[0].trim();
                    String usageYearMonth = tokens[1].trim();
                    String energyType = tokens[2].trim();
                    BigDecimal usageAmount = new BigDecimal(tokens[3].trim());
                    String usageUnit = tokens[4].trim();
                    BigDecimal carbonEmissionKg = new BigDecimal(tokens[5].trim());
                    String sourceName = tokens[6].trim();

                    // 메모리 룩업으로 region_id 획득
                    Long regionId = regionMap.get(regionCode);

                    Object[] rowData = new Object[]{
                            regionId, regionCode, usageYearMonth, energyType, usageAmount, usageUnit, carbonEmissionKg, sourceName
                    };

                    chunkBuffer.add(rowData);
                    successRows++;

                    // 1,000건 도달 시 벌크 인서트 수행
                    if (chunkBuffer.size() >= 1000) {
                        executeBatchInsert(insertSql, chunkBuffer);
                        chunkBuffer.clear();
                    }

                } catch (Exception rowEx) {
                    log.warn("[ADMIN BULK UPLOAD WARNING] Skipping invalid row index {}: {}. Content: [{}]", 
                            totalRows, rowEx.getMessage(), line);
                    failedRows++;
                }
            }

            // 남은 버퍼 내 레코드 마저 삽입
            if (!chunkBuffer.isEmpty()) {
                executeBatchInsert(insertSql, chunkBuffer);
                chunkBuffer.clear();
            }
        }

        return new UploadResult(totalRows, successRows, failedRows);
    }

    /**
     * JdbcTemplate의 batchUpdate를 이용하여 벌크 인서트를 호출합니다.
     */
    private void executeBatchInsert(String sql, List<Object[]> batchArgs) {
        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Object[] args = batchArgs.get(i);
                // 1. region_id
                if (args[0] != null) {
                    ps.setLong(1, (Long) args[0]);
                } else {
                    ps.setNull(1, java.sql.Types.BIGINT);
                }
                // 2. region_code
                ps.setString(2, (String) args[1]);
                // 3. usage_year_month
                ps.setString(3, (String) args[2]);
                // 4. energy_type
                ps.setString(4, (String) args[3]);
                // 5. usage_amount
                ps.setBigDecimal(5, (BigDecimal) args[4]);
                // 6. usage_unit
                ps.setString(6, (String) args[5]);
                // 7. carbon_emission_kg
                ps.setBigDecimal(7, (BigDecimal) args[6]);
                // 8. source_name
                ps.setString(8, (String) args[7]);
            }

            @Override
            public int getBatchSize() {
                return batchArgs.size();
            }
        });
    }

    /**
     * 벌크 적재 결과 데이터를 반환하는 내부 헬퍼 클래스
     */
    private static class UploadResult {
        final int totalRows;
        final int successRows;
        final int failedRows;

        UploadResult(int totalRows, int successRows, int failedRows) {
            this.totalRows = totalRows;
            this.successRows = successRows;
            this.failedRows = failedRows;
        }
    }

	//	13.2 던전 수동 발령. 생성된 던전을 6.1과 동일 구조로 반환(201).
	@PostMapping("/dungeons")
	public ResponseEntity<ApiResponse<DungeonDto.ActiveDungeonResponse>> triggerDungeon(
			@AuthenticationPrincipal Long adminUserId,
			@Valid @RequestBody AdminDto.ManualDungeonRequest request) {
		DungeonDto.ActiveDungeonResponse data = adminService.triggerManualDungeon(adminUserId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(data));
	}
 
	//	13.3 회원 상태 변경 (ACTIVE/INACTIVE/BANNED)
	@PatchMapping("/users/{userId}/status")
	public ApiResponse<AdminDto.UserStatusResponse> changeUserStatus(
			@PathVariable Long userId,
			@Valid @RequestBody AdminDto.UserStatusRequest request) {
		return ApiResponse.success(adminService.changeUserStatus(userId, request));
	}
    



}
