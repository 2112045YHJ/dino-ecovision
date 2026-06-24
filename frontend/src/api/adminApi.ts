// src/api/adminApi.ts
// 명세서 v0.8 - 13. admin 도메인

import { apiRequest } from "./apiClient";

export type AdminUploadResponse = {
  uploadId: number;
  fileName: string;
  status: "SUCCESS" | "FAILED";
  insertedRows: number;
  failReason: string | null;
};

// 13.1 공공 데이터 CSV 업로드
export async function uploadCsv(file: File): Promise<AdminUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<AdminUploadResponse>("/api/admin/uploads", {
    method: "POST",
    body: formData,
    fallbackMessage: "CSV 업로드에 실패했습니다.",
  });
}

// 13.2 던전 수동 발령
export async function triggerDungeon(
  reserveRate: number,
  durationMinutes: number = 60,
): Promise<unknown> {
  return apiRequest<unknown>("/api/admin/dungeons", {
    method: "POST",
    body: { reserveRate, durationMinutes },
    fallbackMessage: "던전 발령에 실패했습니다.",
  });
}

// 13.3 회원 상태 변경
export async function changeUserStatus(
  userId: number,
  status: "ACTIVE" | "INACTIVE" | "BANNED",
  reason?: string,
): Promise<{ userId: number; status: string }> {
  return apiRequest<{ userId: number; status: string }>(
    `/api/admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: { status, reason },
      fallbackMessage: "회원 상태 변경에 실패했습니다.",
    },
  );
}
