// src/api/quizApi.ts

import type {
  SubmitQuizRequest,
  SubmitQuizResult,
  TodayQuiz,
} from "../types/quiz";

const API_BASE_URL = "http://localhost:8080";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details: unknown[];
  } | null;
};

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function createAuthHeaders() {
  const accessToken = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

// 오늘의 퀴즈 조회 API
// GET /api/quiz/today
export async function getTodayQuiz(): Promise<TodayQuiz> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/today`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  const result = (await response.json()) as ApiResponse<TodayQuiz>;

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? "오늘의 퀴즈를 불러오지 못했습니다.",
    );
  }

  return result.data;
}

// 퀴즈 정답 제출 API
// POST /api/quiz/{quizId}/submit
export async function submitQuizAnswer(
  quizId: number,
  request: SubmitQuizRequest,
): Promise<SubmitQuizResult> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/${quizId}/submit`, {
    method: "POST",
    credentials: "include",
    headers: createAuthHeaders(),
    body: JSON.stringify(request),
  });

  const result = (await response.json()) as ApiResponse<SubmitQuizResult>;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "퀴즈 제출에 실패했습니다.");
  }

  return result.data;
}
