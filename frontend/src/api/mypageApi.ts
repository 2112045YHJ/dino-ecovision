// src/api/mypageApi.ts

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

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function createJsonHeaders() {
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

// 마이페이지 요약 조회
// GET /api/me/summary
export async function getMySummary(): Promise<MyPageSummary> {
  const response = await fetch(`${API_BASE_URL}/api/me/summary`, {
    method: "GET",
    credentials: "include",
    headers: createJsonHeaders(),
  });

  return readApiResponse<MyPageSummary>(
    response,
    "마이페이지 정보를 불러오지 못했습니다.",
  );
}

// 전기/가스/수도 사용량 입력
// POST /api/me/bills
export async function createMyBill(
  request: CreateBillRequest,
): Promise<BillTrendItem> {
  const response = await fetch(`${API_BASE_URL}/api/me/bills`, {
    method: "POST",
    credentials: "include",
    headers: createJsonHeaders(),
    body: JSON.stringify(request),
  });

  return readApiResponse<BillTrendItem>(
    response,
    "사용량 정보를 저장하지 못했습니다.",
  );
}

// 사용량 추이 조회
// GET /api/me/bills/trend
export async function getMyBillTrend(): Promise<BillTrendItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/me/bills/trend`, {
    method: "GET",
    credentials: "include",
    headers: createJsonHeaders(),
  });

  const data = await readApiResponse<
    BillTrendItem[] | { items?: BillTrendItem[] }
  >(response, "사용량 추이를 불러오지 못했습니다.");

  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? [];
}
