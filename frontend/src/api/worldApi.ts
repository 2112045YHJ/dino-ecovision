// src/api/worldApi.ts
// 명세서 v0.8 - 4. world 도메인

import { apiRequest } from "./apiClient";

type PowerMix = {
  source: string;
  ratio: number;
};

export type WorldCurrentResponse = {
  carbonIntensity: number;
  gradeStatus: "PURIFIED" | "NORMAL" | "POLLUTED";
  carbonWeight: number;
  reserveRate: number;
  powerMix: PowerMix[];
  dungeonActive: boolean;
  measuredAt: string;
  isFallback: boolean;
};

// 4.1 현재 세계 상태 조회 (5초 폴링용)
export async function getCurrentWorld(): Promise<WorldCurrentResponse> {
  return apiRequest<WorldCurrentResponse>("/api/world/current", {
    method: "GET",
    fallbackMessage: "세계 상태 조회에 실패했습니다.",
  });
}
