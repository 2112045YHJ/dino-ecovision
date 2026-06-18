// src/api/userApi.ts

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

export type MeResponse = {
  userId?: number;
  id?: number;
  email?: string;
  nickname?: string;
  role?: string;
  status?: string;

  regionId?: number | null;
  regionName?: string | null;
  regionCode?: string | null;

  onboarded?: boolean;
  isOnboarded?: boolean;
};

export type RegionResponse = {
  regionId?: number;
  id?: number;
  code?: string;
  regionCode?: string;
  name?: string;
  regionName?: string;
  sido?: string;
  sigungu?: string;
};

export type NicknameCheckResponse = {
  available?: boolean;
  duplicated?: boolean;
};

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function createJsonHeaders() {
  const accessToken = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

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

// 내 프로필 조회
// GET /api/me
export async function getMe(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: "GET",
    credentials: "include",
    headers: createJsonHeaders(),
  });

  return readApiResponse<MeResponse>(
    response,
    "내 정보를 불러오지 못했습니다.",
  );
}

// 닉네임 중복 확인
// GET /api/me/nickname/check?nickname=...
export async function checkNickname(
  nickname: string,
): Promise<NicknameCheckResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/me/nickname/check?nickname=${encodeURIComponent(
      nickname,
    )}`,
    {
      method: "GET",
      credentials: "include",
      headers: createJsonHeaders(),
    },
  );

  return readApiResponse<NicknameCheckResponse>(
    response,
    "닉네임 중복 확인에 실패했습니다.",
  );
}

// 닉네임 변경
// PATCH /api/me/nickname
export async function updateNickname(nickname: string): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/me/nickname`, {
    method: "PATCH",
    credentials: "include",
    headers: createJsonHeaders(),
    body: JSON.stringify({ nickname }),
  });

  return readApiResponse<MeResponse>(response, "닉네임 변경에 실패했습니다.");
}

// 지역 목록 조회
// GET /api/regions
export async function getRegions(): Promise<RegionResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/regions`, {
    method: "GET",
    credentials: "include",
    headers: createJsonHeaders(),
  });

  const data = await readApiResponse<
    RegionResponse[] | { regions?: RegionResponse[]; items?: RegionResponse[] }
  >(response, "지역 목록을 불러오지 못했습니다.");

  if (Array.isArray(data)) {
    return data;
  }

  return data.regions ?? data.items ?? [];
}

// 지역 변경
// PATCH /api/me/region
export async function updateRegion(regionId: number): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/me/region`, {
    method: "PATCH",
    credentials: "include",
    headers: createJsonHeaders(),
    body: JSON.stringify({ regionId }),
  });

  return readApiResponse<MeResponse>(response, "지역 변경에 실패했습니다.");
}
