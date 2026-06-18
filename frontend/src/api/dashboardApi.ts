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
}): Promise<DashboardChartSnapshotResponse> {
  const token = localStorage.getItem("accessToken");
  return await apiRequest<DashboardChartSnapshotResponse>("/api/charts/snapshot", {
    method: "POST",
    body: request,
    token,
  });
}

// -------------------------------------------------------------
// 조원 추가 API (명세서 v0.8 - 10. dashboard 도메인)

const API_BASE_URL = "http://localhost:8080";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  } | null;
};

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

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function createAuthHeaders() {
  const accessToken = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function readApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || result.success === false) {
    throw new Error(result.error?.message ?? fallbackMessage);
  }

  return result.data;
}

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

  const response = await fetch(
    `${API_BASE_URL}/api/energy/stats?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: createAuthHeaders(),
    },
  );

  return readApiResponse<EnergyStatsResponse>(
    response,
    "에너지 통계 조회에 실패했습니다.",
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

  const response = await fetch(
    `${API_BASE_URL}/api/energy/compare?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: createAuthHeaders(),
    },
  );

  return readApiResponse<EnergyCompareResponse>(
    response,
    "지역 비교 조회에 실패했습니다.",
  );
}

// 10.3 차트 스냅샷 생성
export async function createChartSnapshot(request: {
  regionCode: string;
  year: number;
  month?: number;
  type: "ELECTRICITY" | "GAS";
}): Promise<CompareChartSnapshotResponse> {
  const response = await fetch(`${API_BASE_URL}/api/charts/snapshot`, {
    method: "POST",
    credentials: "include",
    headers: createAuthHeaders(),
    body: JSON.stringify(request),
  });

  return readApiResponse<CompareChartSnapshotResponse>(
    response,
    "차트 스냅샷 생성에 실패했습니다.",
  );
}

// 10.4 차트 스냅샷 조회
export async function getChartSnapshot(
  uuid: string,
): Promise<EnergyStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/charts/snapshot/${uuid}`, {
    method: "GET",
    credentials: "include",
    headers: createAuthHeaders(),
  });

  return readApiResponse<EnergyStatsResponse>(
    response,
    "차트 스냅샷 조회에 실패했습니다.",
  );
}
