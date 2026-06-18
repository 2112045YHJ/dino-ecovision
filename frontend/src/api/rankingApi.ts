// src/api/rankingApi.ts
// 명세서 v0.8 - 8. ranking 도메인

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

export type MyRank = {
  rank: number | null;
  rankingPoint: number;
  percentile: number | null;
};

export type RankingItem = {
  rank: number;
  nickname: string;
  regionName: string;
  rankingPoint: number;
};

export type PersonalRankingResponse = {
  scope: "national" | "region";
  seasonName: string;
  myRank: MyRank;
  rankings: RankingItem[];
};

export type RegionMapItem = {
  regionCode: string;
  regionName: string;
  savedCarbonKg: number;
  intensity: number;
};

export type TopRegionItem = {
  rank: number;
  regionName: string;
  savedCarbonKg: number;
};

export type RegionMapRankingResponse = {
  regions: RegionMapItem[];
  topRegions: TopRegionItem[];
};

export type SeasonInfoResponse = {
  seasonId: number;
  name: string;
  startsAt: string;
  endsAt: string;
  remainingDays: number;
};

export type SeasonReward = {
  rewardId: number;
  seasonName: string;
  guildRank: number | null;
  badge: string | null;
  energyGranted: number;
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

// 8.1 개인 랭킹 조회
export async function getPersonalRanking(
  scope: "national" | "region" = "national",
  page: number = 0,
  size: number = 20,
): Promise<PersonalRankingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/rankings/personal?scope=${scope}&page=${page}&size=${size}`,
    {
      method: "GET",
      credentials: "include",
      headers: createAuthHeaders(),
    },
  );

  return readApiResponse<PersonalRankingResponse>(
    response,
    "개인 랭킹 조회에 실패했습니다.",
  );
}

// 8.2 지역 맵 랭킹
export async function getRegionMapRanking(
  scope: "national" | "sido" = "national",
): Promise<RegionMapRankingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/rankings/region-map?scope=${scope}`,
    {
      method: "GET",
      credentials: "include",
      headers: createAuthHeaders(),
    },
  );

  return readApiResponse<RegionMapRankingResponse>(
    response,
    "지역 맵 랭킹 조회에 실패했습니다.",
  );
}

// 8.3 현재 시즌 정보
export async function getCurrentSeason(): Promise<SeasonInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/rankings/season`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  return readApiResponse<SeasonInfoResponse>(
    response,
    "시즌 정보 조회에 실패했습니다.",
  );
}

// 8.4 시즌 보상 조회
export async function getSeasonRewards(): Promise<SeasonReward[]> {
  const response = await fetch(`${API_BASE_URL}/api/me/season-rewards`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  return readApiResponse<SeasonReward[]>(
    response,
    "시즌 보상 조회에 실패했습니다.",
  );
}

// 8.4 시즌 보상 확인 (열람 처리)
export async function confirmSeasonReward(rewardId: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/me/season-rewards/${rewardId}/confirm`,
    {
      method: "POST",
      credentials: "include",
      headers: createAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("시즌 보상 확인에 실패했습니다.");
  }
}
