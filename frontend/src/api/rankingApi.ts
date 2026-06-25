// src/api/rankingApi.ts
// 명세서 v0.8 - 8. ranking 도메인

import { apiRequest } from "./apiClient";

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

// 8.1 개인 랭킹 조회
export async function getPersonalRanking(
  scope: "national" | "region" = "national",
  page: number = 0,
  size: number = 20,
): Promise<PersonalRankingResponse> {
  return apiRequest<PersonalRankingResponse>(
    `/api/rankings/personal?scope=${scope}&page=${page}&size=${size}`,
    {
      method: "GET",
      fallbackMessage: "개인 랭킹 조회에 실패했습니다.",
    },
  );
}

// 8.2 지역 맵 랭킹
export async function getRegionMapRanking(
  scope: "national" | "sido" = "national",
): Promise<RegionMapRankingResponse> {
  return apiRequest<RegionMapRankingResponse>(
    `/api/rankings/region-map?scope=${scope}`,
    {
      method: "GET",
      fallbackMessage: "지역 맵 랭킹 조회에 실패했습니다.",
    },
  );
}

// 8.3 현재 시즌 정보
export async function getCurrentSeason(): Promise<SeasonInfoResponse> {
  return apiRequest<SeasonInfoResponse>("/api/rankings/season", {
    method: "GET",
    fallbackMessage: "시즌 정보 조회에 실패했습니다.",
  });
}

// 8.4 시즌 보상 조회
export async function getSeasonRewards(): Promise<SeasonReward[]> {
  return apiRequest<SeasonReward[]>("/api/me/season-rewards", {
    method: "GET",
    fallbackMessage: "시즌 보상 조회에 실패했습니다.",
  });
}

// 8.4 시즌 보상 확인 (열람 처리)
export async function confirmSeasonReward(rewardId: number): Promise<void> {
  await apiRequest<void>(`/api/me/season-rewards/${rewardId}/confirm`, {
    method: "POST",
    fallbackMessage: "시즌 보상 확인에 실패했습니다.",
  });
}
