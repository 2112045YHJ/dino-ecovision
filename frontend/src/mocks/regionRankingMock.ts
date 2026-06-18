// src/mocks/regionRankingMock.ts

export type RegionRankingItem = {
  rank: number;
  regionName: string;
  participantCount: number;
  totalPoint: number;
  reducedCarbonKg: number;
  mainMission: string;
};

export const regionRankingMock: RegionRankingItem[] = [
  {
    rank: 1,
    regionName: "해운대구",
    participantCount: 124,
    totalPoint: 18640,
    reducedCarbonKg: 246.8,
    mainMission: "대기전력 차단",
  },
  {
    rank: 2,
    regionName: "수영구",
    participantCount: 98,
    totalPoint: 15420,
    reducedCarbonKg: 211.3,
    mainMission: "조명 끄기",
  },
  {
    rank: 3,
    regionName: "부산진구",
    participantCount: 112,
    totalPoint: 14980,
    reducedCarbonKg: 198.1,
    mainMission: "샤워 시간 줄이기",
  },
  {
    rank: 4,
    regionName: "동래구",
    participantCount: 87,
    totalPoint: 12310,
    reducedCarbonKg: 165.4,
    mainMission: "냉난방 온도 조절",
  },
];
