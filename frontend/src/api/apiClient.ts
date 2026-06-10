// src/api/apiClient.ts

const API_BASE_URL = "http://localhost:8080";

// 백엔드에서 에러가 났을 때 details 안에 들어오는 필드별 에러입니다.
export interface ApiErrorDetail {
  field: string;
  message: string;
}

// 백엔드 에러 응답 구조입니다.
export interface ApiError {
  code: string;
  message: string;
  details: ApiErrorDetail[];
}

// 백엔드 공통 응답 구조입니다.
// 백엔드는 success, data, error 모양으로 응답합니다.
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

// API 요청을 보낼 때 사용할 옵션입니다.
interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
}

// 백엔드에 요청을 보내는 공통 함수입니다.
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(
      result.error?.message ?? "요청 처리 중 오류가 발생했습니다.",
    );
  }

  return result.data as T;
}
