package com.ecovision.app.domain.quiz.entity;

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
@Table(name = "quizzes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Quiz {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String question;
	
	@Column(name = "option_a", nullable = false)
	private String optionA;

	@Column(name = "option_b", nullable = false)
	private String optionB;
	
	@Column(name = "option_c")
	private String optionC;
	
	@Column(name = "correct_option", nullable = false)
	private String correctOption;
		
	private String explanation;
	
	@Column(name = "reward_point", nullable = false)
	private int rewardPoint;
	
	@Column(name = "is_Active", nullable = false)
	private boolean isActive;
	
	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", insertable = false, updatable = false)
	private LocalDateTime updatedAt;
}
