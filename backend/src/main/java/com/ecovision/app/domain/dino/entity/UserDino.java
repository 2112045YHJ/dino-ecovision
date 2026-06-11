package com.ecovision.app.domain.dino.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

//	user_dinos 매핑 (사용자 1:1 대표 공룡). 부화 시 EGG로 생성.
//	exp/affinity/진화 갱신 로직은 4단계(미션 완료)에서 추가.
@Entity
@Table(name = "user_dinos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserDino {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false, unique = true)
	private Long userId;

	@Column(name = "dino_template_id", nullable = false)
	private Long dinoTemplateId;

	private String nickname;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private DinoStage stage;

	@Column(nullable = false)
	private int exp;

	@Column(nullable = false)
	private int affinity;

	@Column(name = "evolved_at")
	private LocalDateTime evolvedAt;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", insertable = false, updatable = false)
	private LocalDateTime updatedAt;

	private UserDino(Long userId, Long dinoTemplateId, String nickname) {
		this.userId = userId;
		this.dinoTemplateId = dinoTemplateId;
		this.nickname = nickname;
		this.stage = DinoStage.EGG;
		this.exp = 0;
		this.affinity = 0;
	}

	// 부화: EGG 상태로 생성
	public static UserDino hatch(Long userId, Long dinoTemplateId, String nickname) {
		return new UserDino(userId, dinoTemplateId, nickname);
	}
}
