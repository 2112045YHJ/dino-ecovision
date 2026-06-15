// src/mocks/adminMock.ts

export type UploadLogItem = {
  id: number;
  fileName: string;
  uploadType: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  uploadedAt: string;
  rowCount: number;
};

export const uploadLogsMock: UploadLogItem[] = [
  {
    id: 1,
    fileName: "energy_usage_2026_06.csv",
    uploadType: "전력 사용량",
    status: "SUCCESS",
    uploadedAt: "2026-06-15 10:20",
    rowCount: 240,
  },
  {
    id: 2,
    fileName: "carbon_emission_busan.csv",
    uploadType: "탄소 배출량",
    status: "SUCCESS",
    uploadedAt: "2026-06-14 16:10",
    rowCount: 128,
  },
  {
    id: 3,
    fileName: "mission_factor.csv",
    uploadType: "미션 감축계수",
    status: "FAILED",
    uploadedAt: "2026-06-13 09:40",
    rowCount: 0,
  },
];
