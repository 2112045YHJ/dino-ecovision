// src/api/dinoApi.ts

import type { DinoStage, DinoType } from "../assets/images/dinos/dinoImages";

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

// 공룡 선택 저장 요청 타입입니다.
// 백엔드가 확인해준 요청 body 형태입니다.
type HatchDinoRequest = {
  templateId: number;
  nickname: string;
};

// 공룡 선택 저장 응답 타입입니다.
// POST /api/me/dino/hatch 응답입니다.
export type HatchDinoResponse = {
  dinoId: number;
  nickname: string;
  stage: DinoStage;
  exp: number;
  affinity: number;
};

// 내 공룡 조회 응답 타입입니다.
// GET /api/me/dino 응답입니다.
// templateCode는 아직 백엔드가 추가 가능 여부 확인 중이므로 지금은 넣지 않습니다.
export type MyDinoResponse = {
  dinoId: number;
  nickname: string;
  templateName: string;
  stage: DinoStage;
  exp: number;
  nextStageExp: number;
  affinity: number;
};

// 프론트 공룡 타입을 백엔드 templateId로 바꿔주는 표입니다.
// 프론트: TYRANO / SAURO / CERATO
// 백엔드: templateId 1 / 2 / 3
const dinoTemplateIdMap: Record<DinoType, number> = {
  TYRANO: 1,
  SAURO: 2,
  CERATO: 3,
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

// 공룡 선택 저장 API
// POST /api/me/dino/hatch
export async function hatchDino(params: {
  dinoType: DinoType;
  nickname: string;
}): Promise<HatchDinoResponse> {
  const request: HatchDinoRequest = {
    templateId: dinoTemplateIdMap[params.dinoType],
    nickname: params.nickname,
  };

  const response = await fetch(`${API_BASE_URL}/api/me/dino/hatch`, {
    method: "POST",
    credentials: "include",
    headers: createAuthHeaders(),
    body: JSON.stringify(request),
  });

  const result = (await response.json()) as ApiResponse<HatchDinoResponse>;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "공룡 선택 저장에 실패했습니다.");
  }

  return result.data;
}

// 내 공룡 조회 API
// GET /api/me/dino
export async function getMyDino(): Promise<MyDinoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/me/dino`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  const result = (await response.json()) as ApiResponse<MyDinoResponse>;

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? "내 공룡 정보를 불러오지 못했습니다.",
    );
  }

  return result.data;
}
