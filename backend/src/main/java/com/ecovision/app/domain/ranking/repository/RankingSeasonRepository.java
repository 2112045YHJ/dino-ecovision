package com.ecovision.app.domain.ranking.repository;

import com.ecovision.app.domain.ranking.entity.RankingSeason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RankingSeasonRepository extends JpaRepository<RankingSeason, Long> {

    /**
     * 현재 활성화된 랭킹 시즌을 조회합니다.
     */
    Optional<RankingSeason> findFirstByIsActiveTrue();
}
