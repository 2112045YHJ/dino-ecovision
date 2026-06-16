package com.ecovision.app.domain.ranking.repository;

import com.ecovision.app.domain.ranking.entity.GuildRankingScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuildRankingScoreRepository extends JpaRepository<GuildRankingScore, Long> {

    Optional<GuildRankingScore> findByGuildIdAndSeasonId(Long guildId, Long seasonId);
}
