// src/mocks/guildMock.ts

export type GuildRankingItem = {
  rank: number;
  guildName: string;
  regionName: string;
  memberCount: number;
  totalPoint: number;
  reducedCarbonKg: number;
<<<<<<< HEAD
  mainMission: string;
=======
>>>>>>> feature/community-fe-setup
};

export const myGuildMock = {
  guildName: "해운대 에코 길드",
  regionName: "부산 해운대구",
  memberCount: 24,
  totalPoint: 8420,
  reducedCarbonKg: 126.5,
  myContributionPoint: 320,
<<<<<<< HEAD
  myRankInGuild: 7,
=======
>>>>>>> feature/community-fe-setup
};

export const guildRankingMock: GuildRankingItem[] = [
  {
    rank: 1,
    guildName: "해운대 에코 길드",
    regionName: "부산 해운대구",
    memberCount: 24,
    totalPoint: 8420,
    reducedCarbonKg: 126.5,
<<<<<<< HEAD
    mainMission: "대기전력 차단",
=======
>>>>>>> feature/community-fe-setup
  },
  {
    rank: 2,
    guildName: "수영 절전단",
    regionName: "부산 수영구",
    memberCount: 19,
    totalPoint: 7350,
    reducedCarbonKg: 103.7,
<<<<<<< HEAD
    mainMission: "조명 끄기",
=======
>>>>>>> feature/community-fe-setup
  },
  {
    rank: 3,
    guildName: "부산진 탄소제로",
    regionName: "부산 부산진구",
    memberCount: 21,
    totalPoint: 6910,
    reducedCarbonKg: 95.2,
<<<<<<< HEAD
    mainMission: "샤워 시간 줄이기",
=======
>>>>>>> feature/community-fe-setup
  },
];
