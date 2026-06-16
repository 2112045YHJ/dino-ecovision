// src/api/dinoApi.ts

import type { DinoStage, DinoType } from "../assets/images/dinos/dinoImages";

const API_BASE_URL = "http://localhost:8080";

/*
  백엔드 공통 응답 형태입니다.

  백엔드 응답 예시:

  {
    "success": true,
    "data": {...},
    "error": null
  }

  또는 에러가 나면:

  {
    "success": false,
    "data": null,
    "error": {
      "code": "DINO_ALREADY_EXISTS",
      "message": "이미 공룡을 보유하고 있습니다.",
      "details": []
    }
  }
*/
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details: unknown[];
  } | null;
};

/* =========================
   공룡 선택 API 타입
   ========================= */

// 공룡 선택 저장 요청 타입입니다.
// POST /api/me/dino/hatch 요청 body입니다.
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

/* =========================
   내 공룡 조회 API 타입
   ========================= */

// 내 공룡 조회 응답 타입입니다.
// GET /api/me/dino 응답입니다.
//
// templateCode는 현재 타입에 넣지 않습니다.
// 현재 백엔드는 templateName 중심으로 내려주고 있고,
// templateCode는 브랜치마다 응답 여부가 다를 수 있기 때문입니다.
export type MyDinoResponse = {
  dinoId: number;
  nickname: string;
  templateName: string;
  stage: DinoStage;
  exp: number;

  // 최종 성장 단계에서는 다음 성장 경험치가 없을 수 있으므로 null 허용
  nextStageExp: number | null;

  affinity: number;
};

/* =========================
   디노도감 API 타입
   ========================= */

// GET /api/me/dino/collection 안의 공룡 1개 정보입니다.
export type DinoCollectionItem = {
  templateId: number;
  name: string;
  unlocked: boolean;
  unlockCondition: string;
  firstHatchedAt: string | null;
  totalCarbonKg: number | null;
};

// GET /api/me/dino/collection의 data 부분입니다.
export type DinoCollectionResponse = {
  unlockedCount: number;
  totalCount: number;
  dinos: DinoCollectionItem[];
};

/* =========================
   프론트 타입 → 백엔드 templateId 변환표
   ========================= */

// 프론트 공룡 타입을 백엔드 templateId로 바꿔주는 표입니다.
//
// 프론트:
// TYRANO / SAURO / CERATO
//
// 백엔드:
// templateId 1 / 2 / 3
const dinoTemplateIdMap: Record<DinoType, number> = {
  TYRANO: 1,
  SAURO: 2,
  CERATO: 3,
};

/* =========================
   공통 인증 처리 함수
   ========================= */

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

/*
  에러 메시지를 안전하게 꺼내는 함수입니다.

  왜 필요할까?

  백엔드가 error.message를 주면 그걸 보여주고,
  혹시 error가 null이면 우리가 정한 기본 메시지를 보여주기 위해서입니다.
*/
function getApiErrorMessage<T>(
  result: ApiResponse<T>,
  fallbackMessage: string,
) {
  return result.error?.message ?? fallbackMessage;
}

/* =========================
   공룡 선택 저장 API
   ========================= */

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

  if (!response.ok || !result.success) {
    throw new Error(
      getApiErrorMessage(result, "공룡 선택 저장에 실패했습니다."),
    );
  }

  return result.data;
}

/* =========================
   내 공룡 조회 API
   ========================= */

// 내 공룡 조회 API
// GET /api/me/dino
export async function getMyDino(): Promise<MyDinoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/me/dino`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  const result = (await response.json()) as ApiResponse<MyDinoResponse>;

  if (!response.ok || !result.success) {
    throw new Error(
      getApiErrorMessage(result, "내 공룡 정보를 불러오지 못했습니다."),
    );
  }

  return result.data;
}

/* =========================
   디노도감 조회 API
   ========================= */

// 디노도감 조회 API
// GET /api/me/dino/collection
export async function getMyDinoCollection(): Promise<DinoCollectionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/me/dino/collection`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  const result = (await response.json()) as ApiResponse<DinoCollectionResponse>;

  if (!response.ok || !result.success) {
    throw new Error(
      getApiErrorMessage(result, "디노도감 정보를 불러오지 못했습니다."),
    );
  }

  return result.data;
}
