// src/api/dinoApi.ts

import type { DinoStage, DinoType } from "../assets/images/dinos/dinoImages";

import { apiRequest } from "./apiClient";

/* =========================
   공룡 선택 저장 타입
   POST /api/me/dino/hatch
   ========================= */

type HatchDinoRequest = {
  templateId: number;
  nickname: string;
};

export type HatchDinoResponse = {
  dinoId: number;
  nickname: string;
  stage: DinoStage;
  exp: number;
  affinity: number;
};

/* =========================
   내 공룡 조회 타입
   GET /api/me/dino
   ========================= */

export type MyDinoResponse = {
  dinoId: number;
  nickname: string;

  // 백엔드 응답 예시: TYRANO / SAURO / CERATO
  templateCode: DinoType | string;

  templateName: string;

  // 백엔드 응답 예시: EGG / HATCHLING / JUVENILE / ADULT
  stage: DinoStage | string;

  exp: number;

  // ADULT 최종 단계면 null이 올 수 있습니다.
  nextStageExp: number | null;

  affinity: number;
};

/* =========================
   디노도감 조회 타입
   GET /api/me/dino/collection
   ========================= */

export type DinoCollectionItem = {
  templateId: number;
  name: string;
  unlocked: boolean;
  unlockCondition: string | null;
  firstHatchedAt: string | null;
  totalCarbonKg: number | null;
};

export type DinoCollectionResponse = {
  unlockedCount: number;
  totalCount: number;
  dinos: DinoCollectionItem[];
};

/* =========================
   프론트 공룡 타입 → 백엔드 templateId 변환표
   ========================= */

const dinoTemplateIdMap: Record<DinoType, number> = {
  TYRANO: 1,
  SAURO: 2,
  CERATO: 3,
};

/* =========================
   공룡 선택 저장 API
   ========================= */

// POST /api/me/dino/hatch
export async function hatchDino(params: {
  dinoType: DinoType;
  nickname: string;
}): Promise<HatchDinoResponse> {
  const request: HatchDinoRequest = {
    templateId: dinoTemplateIdMap[params.dinoType],
    nickname: params.nickname,
  };

  return apiRequest<HatchDinoResponse>("/api/me/dino/hatch", {
    method: "POST",
    body: request,
    fallbackMessage: "공룡 선택 저장에 실패했습니다.",
  });
}

/* =========================
   내 공룡 조회 API
   ========================= */

// GET /api/me/dino
export async function getMyDino(): Promise<MyDinoResponse> {
  return apiRequest<MyDinoResponse>("/api/me/dino", {
    method: "GET",
    fallbackMessage: "내 공룡 정보를 불러오지 못했습니다.",
  });
}

/* =========================
   내 공룡 도감 조회 API
   ========================= */

// GET /api/me/dino/collection
export async function getMyDinoCollection(): Promise<DinoCollectionResponse> {
  return apiRequest<DinoCollectionResponse>("/api/me/dino/collection", {
    method: "GET",
    fallbackMessage: "공룡 도감 정보를 불러오지 못했습니다.",
  });
}
