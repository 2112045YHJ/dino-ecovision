// src/api/missionApi.ts

import type {
  CompleteMissionRequest,
  CompleteMissionResult,
  Mission,
} from "../types/mission";

import { apiRequest } from "./apiClient";

// 오늘의 미션 목록 조회 API
// GET /api/missions/today
export async function getTodayMissions(): Promise<Mission[]> {
  return apiRequest<Mission[]>("/api/missions/today", {
    method: "GET",
    fallbackMessage: "오늘의 미션 목록을 불러오지 못했습니다.",
  });
}

// 미션 완료 API
// POST /api/missions/{assignmentId}/complete
export async function completeMission(
  assignmentId: number,
  request: CompleteMissionRequest = { type: "DAILY" },
): Promise<CompleteMissionResult> {
  return apiRequest<CompleteMissionResult>(
    `/api/missions/${assignmentId}/complete`,
    {
      method: "POST",
      body: request,
      fallbackMessage: "미션 완료 처리에 실패했습니다.",
    },
  );
}
