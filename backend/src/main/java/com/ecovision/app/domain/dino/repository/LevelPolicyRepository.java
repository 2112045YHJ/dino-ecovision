package com.ecovision.app.domain.dino.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.dino.entity.LevelPolicy;

public interface LevelPolicyRepository extends JpaRepository<LevelPolicy, Long> {

	// 진화 단계 순서대로 (EGG → HATCHLING → JUVENILE → ADULT)
	List<LevelPolicy> findAllByOrderBySortOrderAsc();
}
