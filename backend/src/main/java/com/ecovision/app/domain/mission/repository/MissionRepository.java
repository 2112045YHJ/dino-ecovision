package com.ecovision.app.domain.mission.repository;

import com.ecovision.app.domain.mission.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {

    /**
     * 활성화된 미션 중 특정 운영 방식(DAILY, WEEKLY 등)의 미션 목록을 조회합니다.
     */
    List<Mission> findByIsActiveTrueAndMissionType(String missionType);
}
