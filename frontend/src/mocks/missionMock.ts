// src/mocks/missionMock.ts

import type { Mission } from "../types/mission";

// 백엔드 API가 아직 없어도 화면을 만들 수 있게 사용하는 가짜 미션 데이터입니다.
export const mockMissions: Mission[] = [
  {
    assignmentId: 1,
    missionId: 101,
    missionName: "대기전력 차단하기",
    categoryLabel: "전기 절약",
    description: "사용하지 않는 가전제품의 플러그를 뽑아주세요.",
    proofGuideText:
      "오늘 사용하지 않는 멀티탭 전원을 껐다면 완료를 눌러주세요.",
    baseReward: 70,
    carbonWeight: 1.2,
    finalRewardPoint: 84,
    estimatedReductionKg: 0.23,
    status: "ASSIGNED",
  },
  {
    assignmentId: 2,
    missionId: 102,
    missionName: "텀블러 사용하기",
    categoryLabel: "일회용품 줄이기",
    description: "일회용 컵 대신 텀블러를 사용해보세요.",
    proofGuideText: "오늘 텀블러를 사용했다면 완료를 눌러주세요.",
    baseReward: 50,
    carbonWeight: 1.0,
    finalRewardPoint: 50,
    estimatedReductionKg: 0.08,
    status: "ASSIGNED",
  },
  {
    assignmentId: 3,
    missionId: 103,
    missionName: "실내 적정 온도 유지하기",
    categoryLabel: "냉난방 절약",
    description: "냉난방 온도를 적정 온도로 맞춰 에너지를 절약해보세요.",
    proofGuideText: "실내 온도를 적정 온도로 유지했다면 완료를 눌러주세요.",
    baseReward: 80,
    carbonWeight: 1.5,
    finalRewardPoint: 120,
    estimatedReductionKg: 0.35,
    status: "ASSIGNED",
  },
];
