// src/api/meApi.ts

// 백엔드 서버 주소입니다.
// 지금 로컬 백엔드는 8080번 포트에서 실행 중입니다.
const API_BASE_URL = "http://localhost:8080";

// 백엔드 공통 응답 형태입니다.
// 백엔드는 보통 { success, data, error } 구조로 응답합니다.
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details: unknown[];
  } | null;
};

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

// 온보딩 저장 요청 타입입니다.
// 프론트가 백엔드에게 보내는 값입니다.
type SaveOnboardingRequest = {
  nickname: string;
  regionCode: string;
};

// 닉네임 중복 확인 응답 타입입니다.
// 실제 백엔드 응답 필드명이 다르면 나중에 여기만 수정하면 됩니다.
export type NicknameCheckResult = {
  available: boolean;
  nickname?: string;
  message?: string;
};

// accessToken을 꺼내는 함수입니다.
// 로그인 성공 후 localStorage에 저장된 토큰을 가져옵니다.
function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// 인증이 필요한 API에서 공통으로 사용할 headers입니다.
function createAuthHeaders() {
  const accessToken = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

// 내 프로필 조회 API
// GET /api/me
export async function getMe(): Promise<MeProfile> {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  const result = (await response.json()) as ApiResponse<MeProfile>;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "내 정보를 불러오지 못했습니다.");
  }

  return result.data;
}

// 닉네임 중복 확인 API
// GET /api/me/nickname/check?nickname=닉네임
export async function checkNickname(
  nickname: string,
): Promise<NicknameCheckResult> {
  const params = new URLSearchParams({
    nickname,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/me/nickname/check?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: createAuthHeaders(),
    },
  );

  const result = (await response.json()) as ApiResponse<NicknameCheckResult>;

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? "닉네임 중복 확인에 실패했습니다.",
    );
  }

  return result.data;
}

// 온보딩 프로필 저장 API
// POST /api/me/onboarding
export async function saveOnboardingProfile(
  request: SaveOnboardingRequest,
): Promise<MeProfile> {
  const response = await fetch(`${API_BASE_URL}/api/me/onboarding`, {
    method: "POST",
    credentials: "include",
    headers: createAuthHeaders(),
    body: JSON.stringify(request),
  });

  const result = (await response.json()) as ApiResponse<MeProfile>;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "온보딩 저장에 실패했습니다.");
  }

  return result.data;
}
