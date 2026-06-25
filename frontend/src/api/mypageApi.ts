// src/api/mypageApi.ts

import { apiRequest } from "./apiClient";

export type MyPageSummary = {
  userId?: number;
  email?: string;
  nickname?: string;
  regionName?: string;
  totalPoints?: number;
  rankingPoint?: number;
  completedMissionCount?: number;
  estimatedReductionKg?: number;
  dinoNickname?: string;
  dinoStage?: string;
};

export type CreateBillRequest = {
  billMonth: string;
  electricityKwh: number;
  electricityCost: number;
  gasUsage?: number;
  waterUsage?: number;
};

export type BillTrendItem = {
  billMonth: string;
  electricityKwh?: number;
  electricityCost?: number;
  gasUsage?: number;
  waterUsage?: number;
  estimatedCo2Kg?: number;
};

// 마이페이지 요약 조회
// GET /api/me/summary
export async function getMySummary(): Promise<MyPageSummary> {
  return apiRequest<MyPageSummary>("/api/me/summary", {
    method: "GET",
    fallbackMessage: "마이페이지 정보를 불러오지 못했습니다.",
  });
}

// 전기/가스/수도 사용량 입력
// POST /api/me/bills
export async function createMyBill(
  request: CreateBillRequest,
): Promise<BillTrendItem> {
  return apiRequest<BillTrendItem>("/api/me/bills", {
    method: "POST",
    body: request,
    fallbackMessage: "사용량 정보를 저장하지 못했습니다.",
  });
}

// 사용량 추이 조회
// GET /api/me/bills/trend
export async function getMyBillTrend(): Promise<BillTrendItem[]> {
  const data = await apiRequest<
    BillTrendItem[] | { items?: BillTrendItem[] }
  >("/api/me/bills/trend", {
    method: "GET",
    fallbackMessage: "사용량 추이를 불러오지 못했습니다.",
  });

  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? [];
}
