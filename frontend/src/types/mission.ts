// src/types/mission.ts

// 미션 슬롯 타입입니다.
// DAY: 낮 미션
// EVENING: 저녁 미션
// ANYTIME: 아무 때나 가능한 미션
export type MissionSlot = "DAY" | "EVENING" | "ANYTIME";

// 오늘의 미션 한 개 타입입니다.
// GET /api/missions/today 응답 data 배열 안의 한 항목입니다.
export type Mission = {
  assignmentId: number;
  missionId: number;
  title: string;
  category: string;
  slot: MissionSlot;
  baseReward: number;
  estimatedCo2Kg: number;
  completed: boolean;
};

// 미션 완료 요청 타입입니다.
// POST /api/missions/{assignmentId}/complete 요청 body입니다.
export type CompleteMissionRequest = {
  type: "DAILY" | "DUNGEON";
};

// 미션 완료 후 공룡 변화 정보입니다.
export type MissionCompleteDino = {
  expGained: number;
  totalExp: number;
  affinityGained: number;
  stage: string;
  evolved: boolean;
};

// 미션 완료 응답 타입입니다.
// POST /api/missions/{assignmentId}/complete 응답 data입니다.
export type CompleteMissionResult = {
  assignmentId: number;
  baseReward: number;
  carbonWeight: number;
  dungeonMultiplier: number;
  finalReward: number;
  cappedReward: number;
  dailyLimitReached: boolean;
  co2ReducedKg: number;
  dailyAccumulated: number;
  dailyLimit: number;
  dino: MissionCompleteDino;
};
