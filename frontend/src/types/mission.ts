// src/types/mission.ts

// 미션 상태입니다.
// ASSIGNED: 아직 완료 전
// COMPLETED: 완료함
// EXPIRED: 시간이 지나 만료됨
export type MissionStatus = "ASSIGNED" | "COMPLETED" | "EXPIRED";

// 오늘의 미션 카드에 필요한 데이터 모양입니다.
export interface Mission {
  assignmentId: number; // 오늘 사용자에게 배정된 미션 ID
  missionId: number; // 원본 미션 ID
  missionName: string; // 미션 이름
  categoryLabel: string; // 미션 카테고리
  description: string; // 미션 설명
  proofGuideText: string; // 인증 안내 문구
  baseReward: number; // 기본 보상
  carbonWeight: number; // 탄소 가중치
  finalRewardPoint: number; // 최종 보상
  estimatedReductionKg: number; // 예상 탄소 절감량
  status: MissionStatus; // 미션 상태
}
