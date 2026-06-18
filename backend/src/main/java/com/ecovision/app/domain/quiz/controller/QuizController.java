package com.ecovision.app.domain.quiz.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecovision.app.domain.quiz.dto.QuizDto;
import com.ecovision.app.domain.quiz.service.QuizService;
import com.ecovision.app.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//quiz API: 오늘의 퀴즈 조회 / 정답 제출 (모두 인증 필요)
@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

	private final QuizService quizService;
	
	@GetMapping("/today")
	public ApiResponse<QuizDto.TodayQuiz> today(@AuthenticationPrincipal Long userId) {
		return ApiResponse.success(quizService.getTodayQuiz(userId));
	}
	
	@PostMapping("/{quizId}/submit")
	public ApiResponse<QuizDto.SubmitResponse> submit(
			@AuthenticationPrincipal Long userId,
			@PathVariable("quizId") Long quizId,
			@Valid @RequestBody QuizDto.SubmitRequest request) {
		return ApiResponse.success(quizService.submit(userId, quizId, request));
	}
}
