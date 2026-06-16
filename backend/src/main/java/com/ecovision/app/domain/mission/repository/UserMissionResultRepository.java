package com.ecovision.app.domain.mission.repository;

import com.ecovision.app.domain.mission.entity.UserMissionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserMissionResultRepository extends JpaRepository<UserMissionResult, Long> {

    /**
     * 특정 날짜 범위 내에서 완료된 유저별 미션 결과를 집계합니다.
     * 
     * @return Object[] -> [0]: userId (Long), [1]: completedCount (Long), [2]: totalReduction (BigDecimal), [3]: totalPoints (Long)
     */
    @Query("SELECT r.userId, COUNT(r.id), SUM(r.estimatedReductionKg), SUM(r.rankingPoint) " +
           "FROM UserMissionResult r " +
           "WHERE r.completedAt >= :startDate AND r.completedAt <= :endDate AND r.status = 'COMPLETED' " +
           "GROUP BY r.userId")
    List<Object[]> aggregateUserScores(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
