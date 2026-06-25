// src/api/guildApi.ts
// 명세서 v0.8 - 7. guild 도메인

import { apiRequest } from "./apiClient";

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

// 7.1 내 길드 조회
export async function getMyGuild(): Promise<MyGuildResponse> {
  return apiRequest<MyGuildResponse>("/api/guilds/me", {
    method: "GET",
    fallbackMessage: "내 길드 조회에 실패했습니다.",
  });
}

// 7.2 길드 멤버 목록
export async function getMyGuildMembers(): Promise<GuildMember[]> {
  return apiRequest<GuildMember[]>("/api/guilds/me/members", {
    method: "GET",
    fallbackMessage: "길드 멤버 조회에 실패했습니다.",
  });
}

// 7.3 길드 전국 랭킹
export async function getGuildRanking(
  page: number = 0,
  size: number = 20,
): Promise<GuildRankingItem[]> {
  return apiRequest<GuildRankingItem[]>(
    `/api/guilds/ranking?page=${page}&size=${size}`,
    {
      method: "GET",
      fallbackMessage: "길드 랭킹 조회에 실패했습니다.",
    },
  );
}
