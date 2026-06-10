package com.ecovision.app.domain.ranking.repository;

import com.ecovision.app.domain.ranking.entity.UserRankingScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRankingScoreRepository extends JpaRepository<UserRankingScore, Long> {

    Optional<UserRankingScore> findByUserIdAndSeasonId(Long userId, Long seasonId);
}
