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

	private static final int AFFINITY_MAX = 100;
	
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
	
	// ===== 미션 완료 시 갱신 =====
	
	// 클린에너지(=실적립 포인트)를 EXP에 반영
	public void addCleanEnergy(int amount) {
		this.exp += amount;
	}
	
	// 친밀도 증가(최대 100), 실제 증가분 반환.
	public int increaseAffinity(int amount) {
		int before = this.affinity;
		this.affinity = Math.min(AFFINITY_MAX, this.affinity + amount);
		return this.affinity - before;
	}
	
	// 진화 단계 상승
	public void evolveTo(DinoStage stage, LocalDateTime now) {
		this.stage = stage;
		this.evolvedAt = now;
	}
}
