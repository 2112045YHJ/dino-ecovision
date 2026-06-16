// src/mocks/missionMock.ts

import type { Mission } from "../types/mission";

// 백엔드 API가 완성되기 전까지 사용할 가짜 미션 데이터입니다.
// 지금 Mission 타입은 백엔드 GET /api/missions/today 응답 기준입니다.
export const mockMissions: Mission[] = [
  {
    assignmentId: 1,
    missionId: 1,
    title: "대기전력 차단하기",
    category: "STANDBY",
    slot: "ANYTIME",
    baseReward: 50,
    estimatedCo2Kg: 0.233,
    completed: false,
  },
  {
    assignmentId: 2,
    missionId: 2,
    title: "텀블러 사용하기",
    category: "RECYCLING",
    slot: "DAY",
    baseReward: 50,
    estimatedCo2Kg: 0.24,
    completed: false,
  },
  {
    assignmentId: 3,
    missionId: 3,
    title: "실내 적정 온도 유지하기",
    category: "HEATING",
    slot: "EVENING",
    baseReward: 80,
    estimatedCo2Kg: 0.86,
    completed: false,
  },
];
