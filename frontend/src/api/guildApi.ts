// src/api/guildApi.ts
// 명세서 v0.8 - 7. guild 도메인

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

export type MyGuildResponse = {
  guildId: number;
  name: string;
  regionCode: string;
  seasonScore: number;
  nationalRank: number;
  memberCount: number;
  capacity: number;
  myContribution: number;
  myContributionRank: number;
};

export type GuildMember = {
  userId: number;
  nickname: string;
  role: "LEADER" | "MEMBER";
  seasonContribution: number;
};

export type GuildRankingItem = {
  rank: number;
  guildId: number;
  name: string;
  regionName: string;
  seasonScore: number;
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

// 7.1 내 길드 조회
export async function getMyGuild(): Promise<MyGuildResponse> {
  const response = await fetch(`${API_BASE_URL}/api/guilds/me`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  return readApiResponse<MyGuildResponse>(
    response,
    "내 길드 조회에 실패했습니다.",
  );
}

// 7.2 길드 멤버 목록
export async function getMyGuildMembers(): Promise<GuildMember[]> {
  const response = await fetch(`${API_BASE_URL}/api/guilds/me/members`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  return readApiResponse<GuildMember[]>(
    response,
    "길드 멤버 조회에 실패했습니다.",
  );
}

// 7.3 길드 전국 랭킹
export async function getGuildRanking(
  page: number = 0,
  size: number = 20,
): Promise<GuildRankingItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/guilds/ranking?page=${page}&size=${size}`,
    {
      method: "GET",
      credentials: "include",
      headers: createAuthHeaders(),
    },
  );

  return readApiResponse<GuildRankingItem[]>(
    response,
    "길드 랭킹 조회에 실패했습니다.",
  );
}
