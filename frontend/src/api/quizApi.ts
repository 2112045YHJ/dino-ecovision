// src/api/quizApi.ts

import type {
  SubmitQuizRequest,
  SubmitQuizResult,
  TodayQuiz,
} from "../types/quiz";

import { apiRequest } from "./apiClient";

// 오늘의 퀴즈 조회 API
// GET /api/quiz/today
export async function getTodayQuiz(): Promise<TodayQuiz> {
  return apiRequest<TodayQuiz>("/api/quiz/today", {
    method: "GET",
    fallbackMessage: "오늘의 퀴즈를 불러오지 못했습니다.",
  });
}

// 퀴즈 정답 제출 API
// POST /api/quiz/{quizId}/submit
export async function submitQuizAnswer(
  quizId: number,
  request: SubmitQuizRequest,
): Promise<SubmitQuizResult> {
  return apiRequest<SubmitQuizResult>(`/api/quiz/${quizId}/submit`, {
    method: "POST",
    body: request,
    fallbackMessage: "퀴즈 제출에 실패했습니다.",
  });
}
