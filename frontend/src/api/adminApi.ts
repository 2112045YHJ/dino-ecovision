// src/api/adminApi.ts
// 명세서 v0.8 - 13. admin 도메인

const API_BASE_URL = import.meta.env.DEV ? "http://localhost:8080" : "";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  } | null;
};

export type AdminUploadResponse = {
  uploadId: number;
  fileName: string;
  status: "SUCCESS" | "FAILED";
  insertedRows: number;
  failReason: string | null;
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

// 파일 업로드용 헤더 (Content-Type 없음)
function createUploadHeaders() {
  const accessToken = getAccessToken();

  return {
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

// 13.1 공공 데이터 CSV 업로드
export async function uploadCsv(file: File): Promise<AdminUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/admin/uploads`, {
    method: "POST",
    credentials: "include",
    headers: createUploadHeaders(),
    body: formData,
  });

  return readApiResponse<AdminUploadResponse>(
    response,
    "CSV 업로드에 실패했습니다.",
  );
}

// 13.2 던전 수동 발령
export async function triggerDungeon(
  reserveRate: number,
  durationMinutes: number = 60,
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/admin/dungeons`, {
    method: "POST",
    credentials: "include",
    headers: createAuthHeaders(),
    body: JSON.stringify({ reserveRate, durationMinutes }),
  });

  return readApiResponse<unknown>(response, "던전 발령에 실패했습니다.");
}

// 13.3 회원 상태 변경
export async function changeUserStatus(
  userId: number,
  status: "ACTIVE" | "INACTIVE" | "BANNED",
  reason?: string,
): Promise<{ userId: number; status: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: createAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    },
  );

  return readApiResponse<{ userId: number; status: string }>(
    response,
    "회원 상태 변경에 실패했습니다.",
  );
}
