package com.ecovision.app.domain.quiz.entity;

import java.time.LocalDate;
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
@Table(name = "user_quiz_attempts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserQuizAttempt {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "quiz_id", nullable = false)
	private Long quizId;

	@Column(name = "attempted_date", nullable = false)
	private LocalDate attemptedDate;

	@Column(name = "selected_option", nullable = false)
	private String selectedOption; // 'A' / 'B' / 'C'

	@Column(name = "is_correct", nullable = false)
	private boolean isCorrect;

	@Column(name = "earned_point", nullable = false)
	private int earnedPoint;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	private UserQuizAttempt(Long userId, Long quizId, LocalDate attemptedDate,
			String selectedOption, boolean isCorrect, int earnedPoint) {
		this.userId = userId;
		this.quizId = quizId;
		this.attemptedDate = attemptedDate;
		this.selectedOption = selectedOption;
		this.isCorrect = isCorrect;
		this.earnedPoint = earnedPoint;
	}

	public static UserQuizAttempt of(Long userId, Long quizId, LocalDate date,
			String selectedOption, boolean isCorrect, int earnedPoint) {
		return new UserQuizAttempt(userId, quizId, date, selectedOption, isCorrect, earnedPoint);
	}
}
