// src/api/meApi.ts

import { apiRequest } from "./apiClient";

// 내 프로필 응답 타입입니다.
// GET /api/me 또는 POST /api/me/onboarding 응답에서 사용합니다.
export type MeProfile = {
  userId: number;
  email: string;
  nickname: string | null;
  regionCode: string | null;
  regionName: string | null;
  totalPoints: number;
  rankingPoint: number;
  savedCarbonKg: number;
  role: string;
  onboardingRequired: boolean;
};

// 지역 목록 응답 타입입니다.
// GET /api/regions 응답의 data 배열 안에 들어있는 지역 1개의 모양입니다.
export type Region = {
  regionId: number;
  regionCode: string;
  regionName: string;
};

// 온보딩 저장 요청 타입입니다.
// 프론트가 백엔드에게 보내는 값입니다.
type SaveOnboardingRequest = {
  nickname: string;
  regionCode: string;
};

// 닉네임 중복 확인 응답 타입입니다.
export type NicknameCheckResult = {
  available: boolean;
  nickname?: string;
  message?: string;
};

// 내 프로필 조회 API
// GET /api/me
export async function getMe(): Promise<MeProfile> {
  return apiRequest<MeProfile>("/api/me", {
    method: "GET",
    fallbackMessage: "내 정보를 불러오지 못했습니다.",
  });
}

// 지역 목록 조회 API
// GET /api/regions
export async function getRegions(): Promise<Region[]> {
  return apiRequest<Region[]>("/api/regions", {
    method: "GET",
    fallbackMessage: "지역 목록을 불러오지 못했습니다.",
  });
}

// 닉네임 중복 확인 API
// GET /api/me/nickname/check?nickname=닉네임
export async function checkNickname(
  nickname: string,
): Promise<NicknameCheckResult> {
  const params = new URLSearchParams({ nickname });

  return apiRequest<NicknameCheckResult>(
    `/api/me/nickname/check?${params.toString()}`,
    {
      method: "GET",
      fallbackMessage: "닉네임 중복 확인에 실패했습니다.",
    },
  );
}

// 온보딩 프로필 저장 API
// POST /api/me/onboarding
export async function saveOnboardingProfile(
  request: SaveOnboardingRequest,
): Promise<MeProfile> {
  return apiRequest<MeProfile>("/api/me/onboarding", {
    method: "POST",
    body: request,
    fallbackMessage: "온보딩 저장에 실패했습니다.",
  });
}
