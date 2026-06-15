package com.ecovision.app.domain.mypage.entity;

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

@Entity
@Table(name = "point_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PointHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "point_amount", nullable = false)
	private Integer pointAmount;

	@Column(name = "reason", nullable = false)
	private String reason;

	@Column(name = "related_mission_result_id")
	private Long relatedMissionResultId;

	@Column(name = "related_quiz_attempt_id")
	private Long relatedQuizAttemptId;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;
	
	private PointHistory(Long userId, Integer pointAmount, String reason, Long relatedMissionResultId) {
		this.userId = userId;
		this.pointAmount = pointAmount;
		this.reason = reason;
		this.relatedMissionResultId = relatedMissionResultId;
	}

	// 미션 완료 보상 이력
	public static PointHistory missionComplete(Long userId, int pointAmount, Long missionResultId) {
		return new PointHistory(userId, pointAmount, "MISSION_COMPLETE", missionResultId);
	}
}
