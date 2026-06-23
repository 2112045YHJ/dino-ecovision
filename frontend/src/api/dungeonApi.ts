// src/api/dungeonApi.ts
// 명세서 v0.8 - 6. dungeon 도메인

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

type DungeonMission = {
  assignmentId: number;
  title: string;
  estimatedCo2Kg: number;
  baseReward: number;
};

export type ActiveDungeonResponse = {
  dungeonId: number;
  status: "ACTIVE" | "ENDED";
  reserveRate: number;
  dungeonMultiplier: number;
  startedAt: string;
  endsAt: string;
  remainingSeconds: number;
  missions: DungeonMission[];
} | null;

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

// 6.1 활성 던전 조회
export async function getActiveDungeon(): Promise<ActiveDungeonResponse> {
  const response = await fetch(`${API_BASE_URL}/api/dungeons/active`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  return readApiResponse<ActiveDungeonResponse>(
    response,
    "던전 조회에 실패했습니다.",
  );
}
