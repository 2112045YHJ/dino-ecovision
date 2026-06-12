package com.ecovision.app.domain.dino.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecovision.app.domain.dino.entity.DinoTemplate;

public interface DinoTemplateRepository extends JpaRepository<DinoTemplate, Long> {
}
