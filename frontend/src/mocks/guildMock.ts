// src/mocks/guildMock.ts

export type GuildRankingItem = {
  rank: number;
  guildName: string;
  regionName: string;
  memberCount: number;
  totalPoint: number;
  reducedCarbonKg: number;
};

export const myGuildMock = {
  guildName: "해운대 에코 길드",
  regionName: "부산 해운대구",
  memberCount: 24,
  totalPoint: 8420,
  reducedCarbonKg: 126.5,
  myContributionPoint: 320,
};

export const guildRankingMock: GuildRankingItem[] = [
  {
    rank: 1,
    guildName: "해운대 에코 길드",
    regionName: "부산 해운대구",
    memberCount: 24,
    totalPoint: 8420,
    reducedCarbonKg: 126.5,
  },
  {
    rank: 2,
    guildName: "수영 절전단",
    regionName: "부산 수영구",
    memberCount: 19,
    totalPoint: 7350,
    reducedCarbonKg: 103.7,
  },
  {
    rank: 3,
    guildName: "부산진 탄소제로",
    regionName: "부산 부산진구",
    memberCount: 21,
    totalPoint: 6910,
    reducedCarbonKg: 95.2,
  },
];
