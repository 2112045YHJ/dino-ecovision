// src/api/dungeonApi.ts
// 명세서 v0.8 - 6. dungeon 도메인

import { apiRequest } from "./apiClient";

export type DungeonMission = {
  assignmentId: number;
  title: string;
  estimatedCo2Kg: number;
  baseReward: number;
  completed: boolean;
};

export type ActiveDungeonResponse = {
  dungeonId: number;
  status: "ACTIVE" | "ENDED";
  reserveRate: number;
  dungeonMultiplier: number;
  startedAt: string;
  endsAt: string;
  remainingSeconds: number;
  missions: DungeonMission[];
} | null;

// 6.1 활성 던전 조회
export async function getActiveDungeon(): Promise<ActiveDungeonResponse> {
  return apiRequest<ActiveDungeonResponse>("/api/dungeons/active", {
    method: "GET",
    fallbackMessage: "던전 조회에 실패했습니다.",
  });
}
