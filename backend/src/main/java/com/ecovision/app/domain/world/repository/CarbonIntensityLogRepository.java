package com.ecovision.app.domain.world.repository;

import com.ecovision.app.domain.world.entity.CarbonIntensityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.param.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CarbonIntensityLogRepository extends JpaRepository<CarbonIntensityLog, Long> {

    /**
     * 특정 시각 이후에 측정된 가장 최근의 탄소 기록 1건을 조회합니다.
     * 
     * @param dateTime 기준 시각
     * @return 탄소 기록 1건 (Optional)
     */
    Optional<CarbonIntensityLog> findFirstByMeasuredAtAfterOrderByMeasuredAtDesc(LocalDateTime dateTime);

    /**
     * 최근 1시간 이내에 정상 등록된 전력 데이터 중 가장 최신의 1건을 조회합니다.
     */
    @Query("SELECT c FROM CarbonIntensityLog c WHERE c.measuredAt >= :timeLimit AND c.reserveRate IS NOT NULL ORDER BY c.measuredAt DESC LIMIT 1")
    Optional<CarbonIntensityLog> findLatestLogWithinHour(@Param("timeLimit") LocalDateTime timeLimit);
}
