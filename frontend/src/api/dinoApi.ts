// src/api/dinoApi.ts

import type { DinoStage, DinoType } from "../assets/images/dinos/dinoImages";

const API_BASE_URL = "http://localhost:8080";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  } | null;
};

// 공룡 선택 저장 요청 타입입니다.
// 백엔드가 확인해준 요청 body 형태입니다.
// POST /api/me/dino/hatch 요청 body:
// {
//   "templateId": 1,
//   "nickname": "초록초록이"
// }
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
export type MyDinoResponse = {
  dinoId: number;
  nickname: string;

  // 백엔드에서 내려주는 공룡 코드입니다.
  // 예: TYRANO / SAURO / CERATO
  // 백엔드에서 BRACHIO / TRICERA처럼 다른 이름이 올 수도 있어서 string도 허용합니다.
  templateCode: DinoType | string;

  templateName: string;
  stage: DinoStage | string;
  exp: number;
  nextStageExp: number;
  affinity: number;
};

// 공룡 도감 아이템 타입입니다.
// GET /api/me/dino/collection 응답의 한 줄입니다.
//
// 정확한 백엔드 응답을 아직 못 봤기 때문에
// 자주 쓰는 필드는 optional(?)로 열어둡니다.
// 이렇게 하면 필드가 조금 달라도 프론트가 바로 터지지 않습니다.
export type DinoCollectionItem = {
  collectionId?: number;
  dinoId?: number;

  templateId?: number;
  templateCode?: DinoType | string;
  templateName?: string;

  nickname?: string;
  stage?: DinoStage | string;

  owned?: boolean;
  acquired?: boolean;
  acquiredAt?: string | null;
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

// 공통으로 API 응답을 확인하는 함수입니다.
// success가 false거나 HTTP 상태가 실패면 에러를 던집니다.
async function readApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || result.success === false) {
    throw new Error(result.error?.message ?? fallbackMessage);
  }

  return result.data;
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

  return readApiResponse<HatchDinoResponse>(
    response,
    "공룡 선택 저장에 실패했습니다.",
  );
}

// 내 공룡 조회 API
// GET /api/me/dino
export async function getMyDino(): Promise<MyDinoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/me/dino`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  return readApiResponse<MyDinoResponse>(
    response,
    "내 공룡 정보를 불러오지 못했습니다.",
  );
}

// 내 공룡 도감 조회 API
// GET /api/me/dino/collection
export async function getMyDinoCollection(): Promise<DinoCollectionItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/me/dino/collection`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  const data = await readApiResponse<
    DinoCollectionItem[] | { items?: DinoCollectionItem[] }
  >(response, "공룡 도감 정보를 불러오지 못했습니다.");

  // 백엔드가 data: [...] 형태로 주는 경우
  if (Array.isArray(data)) {
    return data;
  }

  // 백엔드가 data: { items: [...] } 형태로 주는 경우도 방어
  return data.items ?? [];
}
