// src/api/dashboardApi.ts

import { apiRequest } from "./apiClient";

export interface EnergyUsageSumResponse {
  usageYearMonth: string;
  energyType: "ELECTRICITY" | "GAS";
  sumUsageAmount: number;
  sumCarbonEmissionKg: number;
}

export interface DashboardChartSnapshotResponse {
  id: string;
  title: string;
  chartType: string;
  chartMetadata: string; // JSON String
  createdAt: string;
}

// 1. 대시보드 월별 전력/탄소 통계 데이터 조회
export async function fetchEnergySummary(year: string, regionCode: string): Promise<EnergyUsageSumResponse[]> {
  return apiRequest<EnergyUsageSumResponse[]>(
    `/api/data/summary?year=${year}&regionCode=${encodeURIComponent(regionCode)}`,
    { method: "GET" },
  );
}

// 1.5. 대시보드 데이터 초기화 및 API 재수집
export async function resetAndFetchEnergyData(useMock: boolean = false): Promise<string> {
  return apiRequest<string>(`/api/data/reset?useMock=${useMock}`, {
    method: "POST",
  });
}

export interface FilterOptionsResponse {
  years: string[];
  regions: string[];
}

export async function fetchFilterOptions(): Promise<FilterOptionsResponse> {
  return apiRequest<FilterOptionsResponse>("/api/data/filters", {
    method: "GET",
  });
}

// 2. 대시보드 차트 스냅샷 생성 API
export async function createDashboardSnapshot(request: {
  title: string;
  chartType: string;
  chartMetadata: string;
  isSaved?: boolean;
}): Promise<DashboardChartSnapshotResponse> {
  return apiRequest<DashboardChartSnapshotResponse>("/api/charts/snapshot", {
    method: "POST",
    body: request,
  });
}

// -------------------------------------------------------------
// 조원 추가 API (명세서 v0.8 - 10. dashboard 도메인)

export type EnergySeries = {
  period: string;
  usage?: number;
  co2Kg: number;
};

export type EnergyStatsResponse = {
  regionCode: string;
  regionName: string;
  type: "ELECTRICITY" | "GAS";
  series: EnergySeries[];
};

export type CompareRegion = {
  regionCode: string;
  regionName: string;
  series: EnergySeries[];
};

export type EnergyCompareResponse = {
  type: "ELECTRICITY" | "GAS";
  regions: CompareRegion[];
  insight: string | null;
};

export type CompareChartSnapshotResponse = {
  snapshotUuid: string;
  embedUrl: string;
};

// 10.1 지역 에너지 통계 조회
export async function getEnergyStats(
  regionCode: string,
  year: number,
  month: number | undefined,
  type: "ELECTRICITY" | "GAS",
): Promise<EnergyStatsResponse> {
  const params = new URLSearchParams({
    regionCode,
    year: String(year),
    type,
  });
  if (month !== undefined) params.append("month", String(month));

  return apiRequest<EnergyStatsResponse>(
    `/api/energy/stats?${params.toString()}`,
    {
      method: "GET",
      fallbackMessage: "에너지 통계 조회에 실패했습니다.",
    },
  );
}

// 10.2 지역 간 비교 조회 (최대 4개 지역)
export async function getEnergyCompare(
  regionCodes: string[],
  year: number,
  type: "ELECTRICITY" | "GAS",
): Promise<EnergyCompareResponse> {
  const params = new URLSearchParams({
    regionCodes: regionCodes.join(","),
    year: String(year),
    type,
  });

  return apiRequest<EnergyCompareResponse>(
    `/api/energy/compare?${params.toString()}`,
    {
      method: "GET",
      fallbackMessage: "지역 비교 조회에 실패했습니다.",
    },
  );
}

// 10.3 차트 스냅샷 생성
export async function createChartSnapshot(request: {
  regionCode: string;
  year: number;
  month?: number;
  type: "ELECTRICITY" | "GAS";
}): Promise<CompareChartSnapshotResponse> {
  return apiRequest<CompareChartSnapshotResponse>("/api/charts/snapshot", {
    method: "POST",
    body: request,
    fallbackMessage: "차트 스냅샷 생성에 실패했습니다.",
  });
}

// 10.4 차트 스냅샷 조회
export async function getChartSnapshot(
  uuid: string,
): Promise<EnergyStatsResponse> {
  return apiRequest<EnergyStatsResponse>(`/api/charts/snapshot/${uuid}`, {
    method: "GET",
    fallbackMessage: "차트 스냅샷 조회에 실패했습니다.",
  });
}

// 10.5 사용자의 저장된 차트 스냅샷 목록 조회 API
export async function fetchMyChartSnapshots(): Promise<DashboardChartSnapshotResponse[]> {
  return apiRequest<DashboardChartSnapshotResponse[]>("/api/charts/snapshot", {
    method: "GET",
  });
}

// 10.6 차트 스냅샷 삭제 API
export async function deleteChartSnapshot(id: string): Promise<void> {
  return apiRequest<void>(`/api/charts/snapshot/${id}`, {
    method: "DELETE",
  });
}
