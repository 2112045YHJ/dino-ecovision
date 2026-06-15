package com.ecovision.app.domain.dino.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.dino.entity.DinoTemplate;

public interface DinoTemplateRepository extends JpaRepository<DinoTemplate, Long> {
	
	//	도감 조회용: 전체 종 템플릿을 시드 ID 오름차순으로. (SB-13 카드 배치 순서)
	List<DinoTemplate> findAllByOrderByIdAsc();
}
