// src/api/worldApi.ts
// 명세서 v0.8 - 4. world 도메인

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

type PowerMix = {
  source: string;
  ratio: number;
};

export type WorldCurrentResponse = {
  carbonIntensity: number;
  gradeStatus: "PURIFIED" | "NORMAL" | "POLLUTED";
  carbonWeight: number;
  reserveRate: number;
  powerMix: PowerMix[];
  dungeonActive: boolean;
  measuredAt: string;
  isFallback: boolean;
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

// 4.1 현재 세계 상태 조회 (5초 폴링용)
export async function getCurrentWorld(): Promise<WorldCurrentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/world/current`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  return readApiResponse<WorldCurrentResponse>(
    response,
    "세계 상태 조회에 실패했습니다.",
  );
}
