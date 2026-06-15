// src/mocks/worldDungeonMock.ts

export const worldStatusMock = {
  status: "WARNING",
  statusLabel: "주의",
  reserveRate: 8.5,
  carbonIntensity: 431,
  message: "전력 사용량이 높은 시간대입니다. 절전 미션 참여를 권장합니다.",
};

export const activeDungeonMock = {
  active: true,
  title: "전력 피크 던전",
  description:
    "오늘 저녁 전력 사용량이 높은 시간대로 예상되어 절전 미션 보상이 증가합니다.",
  bonusMultiplier: 1.5,
  missionCount: 3,
  startTime: "18:00",
  endTime: "21:00",
};

export const dungeonMissionMock = [
  "사용하지 않는 조명 끄기",
  "멀티탭 대기전력 차단하기",
  "에어컨 설정 온도 1도 높이기",
];
