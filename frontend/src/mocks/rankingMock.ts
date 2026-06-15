// src/mocks/rankingMock.ts

export type UserRankingItem = {
  rank: number;
  nickname: string;
  regionName: string;
  point: number;
  reducedCarbonKg: number;
  completedMissionCount: number;
};

export const userRankingMock: UserRankingItem[] = [
  {
    rank: 1,
    nickname: "초록디노",
    regionName: "부산 해운대구",
    point: 1280,
    reducedCarbonKg: 18.6,
    completedMissionCount: 42,
  },
  {
    rank: 2,
    nickname: "절전왕",
    regionName: "부산 수영구",
    point: 1170,
    reducedCarbonKg: 16.4,
    completedMissionCount: 39,
  },
  {
    rank: 3,
    nickname: "탄소제로",
    regionName: "부산 부산진구",
    point: 980,
    reducedCarbonKg: 13.2,
    completedMissionCount: 33,
  },
  {
    rank: 4,
    nickname: "에코브이",
    regionName: "부산 동래구",
    point: 870,
    reducedCarbonKg: 11.9,
    completedMissionCount: 29,
  },
  {
    rank: 5,
    nickname: "디노친구",
    regionName: "부산 남구",
    point: 760,
    reducedCarbonKg: 9.8,
    completedMissionCount: 24,
  },
];
