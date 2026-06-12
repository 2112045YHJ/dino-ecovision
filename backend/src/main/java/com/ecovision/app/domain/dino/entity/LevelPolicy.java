package com.ecovision.app.domain.dino.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

//	level_policies 매핑 (단계별 진화 임계 EXP, 읽기 전용 시드)
//	시드: EGG 0 / HATCHLING 100 / JUVENILE 500 / ADULT 1000 (잠정치)
@Entity
@Table(name = "level_policies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LevelPolicy {

	@Id
	private Long id;

	@Column(name = "level_code", nullable = false, unique = true)
	private String levelCode; // EGG / HATCHLING / JUVENILE / ADULT

	@Column(name = "level_name", nullable = false)
	private String levelName;

	@Column(name = "required_exp", nullable = false)
	private int requiredExp;

	@Column(name = "badge_image_url")
	private String badgeImageUrl;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;
}
