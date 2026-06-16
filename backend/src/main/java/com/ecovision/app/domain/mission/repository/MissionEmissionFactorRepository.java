package com.ecovision.app.domain.mission.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.mission.entity.MissionEmissionFactor;

public interface MissionEmissionFactorRepository extends JpaRepository<MissionEmissionFactor, Long> {

	Optional<MissionEmissionFactor> findByMissionId(Long missionId);
}
