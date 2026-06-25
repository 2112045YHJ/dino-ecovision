// src/api/userApi.ts

import { apiRequest } from "./apiClient";

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

// 내 프로필 조회
// GET /api/me
export async function getMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/me", {
    method: "GET",
    fallbackMessage: "내 정보를 불러오지 못했습니다.",
  });
}

// 닉네임 중복 확인
// GET /api/me/nickname/check?nickname=...
export async function checkNickname(
  nickname: string,
): Promise<NicknameCheckResponse> {
  return apiRequest<NicknameCheckResponse>(
    `/api/me/nickname/check?nickname=${encodeURIComponent(nickname)}`,
    {
      method: "GET",
      fallbackMessage: "닉네임 중복 확인에 실패했습니다.",
    },
  );
}

// 닉네임 변경
// PATCH /api/me/nickname
export async function updateNickname(nickname: string): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/me/nickname", {
    method: "PATCH",
    body: { nickname },
    fallbackMessage: "닉네임 변경에 실패했습니다.",
  });
}

// 지역 목록 조회
// GET /api/regions
export async function getRegions(): Promise<RegionResponse[]> {
  const data = await apiRequest<
    RegionResponse[] | { regions?: RegionResponse[]; items?: RegionResponse[] }
  >("/api/regions", {
    method: "GET",
    fallbackMessage: "지역 목록을 불러오지 못했습니다.",
  });

  if (Array.isArray(data)) {
    return data;
  }

  return data.regions ?? data.items ?? [];
}

// 지역 변경
// PATCH /api/me/region
export async function updateRegion(regionId: number): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/me/region", {
    method: "PATCH",
    body: { regionId },
    fallbackMessage: "지역 변경에 실패했습니다.",
  });
}
