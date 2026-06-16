package com.ecovision.app.domain.guild.repository;

import com.ecovision.app.domain.guild.entity.Guild;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuildRepository extends JpaRepository<Guild, Long> {

    /**
     * 특정 지역 ID(regionId)로 등록된 길드를 조회합니다. (동네당 1길드)
     */
    Optional<Guild> findByRegionId(Long regionId);
}
