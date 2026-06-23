package com.ecovision.app.domain.quiz.dto;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

// quiz 도메인 요청/응답 DTO
public final class QuizDto {
	
	private QuizDto() {}
	
	public record Option(int optionNo, String text) {}	

	// 오늘의 퀴즈 (GET /api/quiz/today)
	// correct는 미응시면 null
	public record TodayQuiz(
			Long quizId, String question, List<Option> options,
			int reward, boolean attempted, Boolean correct) {}
	
	// 정답 제출 요청 (POST /api/quiz/{quizId}/submit)
	public record SubmitRequest(
			@NotNull(message = "optionNo는 필수입니다.")
			@Min(value = 1, message = "optionNo는 1~3이어야 합니다.")
			@Max(value = 3, message = "optionNo는 1~3이어야 합니다.")
			Integer optionNo
			) {}
	
	// 제출 응답
	public record SubmitResponse(
			boolean correct, int answerNo, String explanation, int rewardGranted) {}
	
}
