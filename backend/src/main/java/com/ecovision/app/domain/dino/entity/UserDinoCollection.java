package com.ecovision.app.domain.dino.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

//	user_dino_collections 매핑 (도감 해금 정보). 첫 부화 시 해당 종을 해금 처리.
@Entity
@Table(name = "user_dino_collections")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserDinoCollection {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "dino_template_id", nullable = false)
	private Long dinoTemplateId;

	@Column(name = "unlocked_at", insertable = false, updatable = false)
	private LocalDateTime unlockedAt;

	private UserDinoCollection(Long userId, Long dinoTemplateId) {
		this.userId = userId;
		this.dinoTemplateId = dinoTemplateId;
	}

	public static UserDinoCollection unlock(Long userId, Long dinoTemplateId) {
		return new UserDinoCollection(userId, dinoTemplateId);
	}
}
