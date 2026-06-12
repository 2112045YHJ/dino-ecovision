package com.ecovision.app.domain.dino.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

//	dino_templates 매핑 (공룡 종 템플릿, 읽기 전용 시드 데이터)
@Entity
@Table(name = "dino_templates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DinoTemplate {

	@Id
	private Long id; // 시드 고정 ID 사용 (AUTO_INCREMENT지만 조회만 함)

	@Column(name = "dino_code", nullable = false, unique = true)
	private String dinoCode;

	@Column(name = "dino_name", nullable = false)
	private String dinoName;

	private String description;

	@Column(name = "egg_image_url")
	private String eggImageUrl;

	@Column(name = "hatchling_image_url")
	private String hatchlingImageUrl;

	@Column(name = "juvenile_image_url")
	private String juvenileImageUrl;

	@Column(name = "adult_image_url")
	private String adultImageUrl;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;
}
