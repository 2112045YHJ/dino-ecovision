// src/api/missionApi.ts

import type {
  CompleteMissionRequest,
  CompleteMissionResult,
  Mission,
} from "../types/mission";

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

// 오늘의 미션 목록 조회 API
// GET /api/missions/today
export async function getTodayMissions(): Promise<Mission[]> {
  const response = await fetch(`${API_BASE_URL}/api/missions/today`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  const result = (await response.json()) as ApiResponse<Mission[]>;

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? "오늘의 미션 목록을 불러오지 못했습니다.",
    );
  }

  return result.data;
}

// 미션 완료 API
// POST /api/missions/{assignmentId}/complete
export async function completeMission(
  assignmentId: number,
  request: CompleteMissionRequest = { type: "DAILY" },
): Promise<CompleteMissionResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/missions/${assignmentId}/complete`,
    {
      method: "POST",
      credentials: "include",
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    },
  );

  const result = (await response.json()) as ApiResponse<CompleteMissionResult>;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "미션 완료 처리에 실패했습니다.");
  }

  return result.data;
}
