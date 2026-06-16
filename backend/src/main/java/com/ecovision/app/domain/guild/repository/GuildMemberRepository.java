package com.ecovision.app.domain.guild.repository;

import com.ecovision.app.domain.guild.entity.GuildMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuildMemberRepository extends JpaRepository<GuildMember, Long> {

    /**
     * 특정 사용자의 현재 활성 길드원 정보를 조회합니다.
     */
    Optional<GuildMember> findByUserId(Long userId);

    /**
     * 특정 시즌의 유저 점수를 기반으로 길드별 총점 및 미션 횟수, 감축량을 집계합니다.
     * 
     * @return Object[] -> [0]: guildId (Long), [1]: totalPoints (Long), [2]: completedCount (Long), [3]: totalReduction (BigDecimal)
     */
    @Query("SELECT m.guildId, SUM(s.rankingPoint), SUM(s.completedMissionCount), SUM(s.estimatedReductionKg) " +
           "FROM GuildMember m, UserRankingScore s " +
           "WHERE m.userId = s.userId AND s.seasonId = :seasonId AND m.leftAt IS NULL " +
           "GROUP BY m.guildId")
    List<Object[]> aggregateGuildScores(@Param("seasonId") Long seasonId);
}
