// src/api/dashboardApi.ts

import { apiRequest } from "./apiClient";

export interface EnergyUsageSumResponse {
  usageYearMonth: string;
  energyType: "ELECTRICITY" | "GAS";
  sumUsageAmount: number;
  sumCarbonEmissionKg: number;
}

export interface ChartSnapshotResponse {
  id: string;
  title: string;
  chartType: string;
  chartMetadata: string; // JSON String
  createdAt: string;
}

// 1. 대시보드 월별 전력/탄소 통계 데이터 조회
export async function fetchEnergySummary(year: string, regionCode: string): Promise<EnergyUsageSumResponse[]> {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<EnergyUsageSumResponse[]>(
    `/api/data/summary?year=${year}&regionCode=${encodeURIComponent(regionCode)}`,
    {
      method: "GET",
      token,
    }
  );
}

// 2. 대시보드 차트 스냅샷 생성 API
export async function createDashboardSnapshot(request: {
  title: string;
  chartType: string;
  chartMetadata: string;
}): Promise<ChartSnapshotResponse> {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<ChartSnapshotResponse>("/api/charts/snapshot", {
    method: "POST",
    body: request,
    token,
  });
}
