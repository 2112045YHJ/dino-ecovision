// src/pages/AdminCsvUploadPage.tsx

import { useState } from "react";
<<<<<<< HEAD

import { Header } from "../components/layout/Header";
import { uploadLogsMock } from "../mocks/adminMock";

export function AdminCsvUploadPage() {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadType, setUploadType] = useState("ENERGY_USAGE");

  const handleFileChange = (file?: File) => {
    if (!file) {
=======
import { useNavigate } from "react-router-dom";

import { uploadCsv, type AdminUploadResponse } from "../api/adminApi";

type UploadHistory = AdminUploadResponse & {
  uploadedAt: string;
};

export function AdminCsvUploadPage() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadType, setUploadType] = useState("ENERGY_USAGE");

  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 업로드 이력 (세션 동안만 유지)
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);

  const handleFileChange = (file?: File) => {
    if (!file) {
      setSelectedFile(null);
>>>>>>> feature/community-fe-setup
      setSelectedFileName("");
      return;
    }

<<<<<<< HEAD
    setSelectedFileName(file.name);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">ADMIN</p>

          <h1 className="mt-1 text-3xl font-bold">CSV 데이터 업로드</h1>

          <p className="mt-1 text-sm text-gray-600">
            전력 사용량, 탄소 배출량, 미션 감축계수 데이터를 업로드하는 관리자
            화면입니다.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              UPLOAD
            </p>

            <h2 className="mt-1 text-xl font-bold">CSV 파일 선택</h2>
=======
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setSuccessMessage("");
      setErrorMessage("");

      const result = await uploadCsv(selectedFile);

      if (result.status === "SUCCESS") {
        setSuccessMessage(
          `${result.fileName} 파일 업로드 성공! (${result.insertedRows}개 행 처리)`,
        );

        // 업로드 이력에 추가
        setUploadHistory((prev) => [
          {
            ...result,
            uploadedAt: new Date().toLocaleString("ko-KR"),
          },
          ...prev,
        ]);

        setSelectedFile(null);
        setSelectedFileName("");
      } else {
        setErrorMessage(
          `업로드 실패: ${result.failReason ?? "알 수 없는 오류"}`,
        );

        // 실패한 것도 이력에 추가
        setUploadHistory((prev) => [
          {
            ...result,
            uploadedAt: new Date().toLocaleString("ko-KR"),
          },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "업로드에 실패했습니다. 파일 형식을 확인해주세요.";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadTypeLabel: Record<string, string> = {
    ENERGY_USAGE: "전력 사용량",
    CARBON_EMISSION: "탄소 배출량",
    MISSION_FACTOR: "미션 감축계수",
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">ADMIN</p>

            <h1 className="mt-2 text-3xl font-bold">CSV 데이터 업로드</h1>

            <p className="mt-2 text-sm text-gray-600">
              전력 사용량, 탄소 배출량, 미션 감축계수 데이터를 업로드하는 관리자
              화면입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/dungeon")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              시스템 제어
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              홈으로 가기
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">UPLOAD</p>

            <h2 className="mt-2 text-xl font-bold">CSV 파일 선택</h2>
>>>>>>> feature/community-fe-setup

            <div className="mt-5">
              <label
                htmlFor="uploadType"
                className="block text-sm font-bold text-[#2C3531]"
              >
                업로드 종류
              </label>

              <select
                id="uploadType"
                value={uploadType}
<<<<<<< HEAD
                onChange={(event) => setUploadType(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
=======
                onChange={(event) => {
                  setUploadType(event.target.value);
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
>>>>>>> feature/community-fe-setup
              >
                <option value="ENERGY_USAGE">전력 사용량</option>
                <option value="CARBON_EMISSION">탄소 배출량</option>
                <option value="MISSION_FACTOR">미션 감축계수</option>
              </select>
            </div>

            <div className="mt-5 rounded-3xl border-2 border-dashed border-[#BFD8CB] bg-[#FAF9F5] p-6 text-center">
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
                className="hidden"
              />

              <label
                htmlFor="csvFile"
                className="inline-block cursor-pointer rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
              >
                CSV 파일 선택
              </label>

              <p className="mt-4 text-sm text-gray-600">
                {selectedFileName || "선택된 파일이 없습니다."}
              </p>
            </div>

<<<<<<< HEAD
            <button
              type="button"
              disabled={!selectedFileName}
              className="mt-5 w-full rounded-2xl bg-[#E07A5F] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#c8654d] disabled:bg-gray-200 disabled:text-gray-400"
            >
              업로드 실행
            </button>

            <p className="mt-3 text-xs text-gray-500">
              현재는 화면 뼈대입니다. 실제 업로드 API가 생기면 이 버튼에 업로드
              요청을 연결하면 됩니다.
            </p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              UPLOAD LOG
            </p>

            <h2 className="mt-1 text-xl font-bold">업로드 이력</h2>

            <div className="mt-4 space-y-3">
              {uploadLogsMock.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{log.fileName}</p>

                      <p className="mt-1 text-xs text-gray-500">
                        {log.uploadType} · {log.uploadedAt}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        log.status === "SUCCESS"
                          ? "bg-[#E8F2EC] text-[#5F8C74]"
                          : log.status === "FAILED"
                            ? "bg-[#FFF1EC] text-[#E07A5F]"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    처리 행 수: {log.rowCount}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
=======
            {successMessage && (
              <div className="mt-4 rounded-2xl bg-[#E8F2EC] p-4 text-sm font-bold text-[#5F8C74]">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFileName || isUploading}
              className="mt-5 w-full rounded-2xl bg-[#E07A5F] py-3 font-bold text-white transition hover:bg-[#c8654d] disabled:bg-gray-300"
            >
              {isUploading
                ? "업로드 중..."
                : `${uploadTypeLabel[uploadType]} 업로드 실행`}
            </button>

            <p className="mt-3 text-xs text-gray-500">
              ⚠️ 관리자 권한이 필요한 작업입니다.
            </p>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">UPLOAD LOG</p>

            <h2 className="mt-2 text-xl font-bold">
              업로드 이력 ({uploadHistory.length}건)
            </h2>

            {uploadHistory.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-6 text-center text-sm font-bold text-gray-500">
                아직 업로드 이력이 없습니다.
              </div>
            ) : (
              <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                {uploadHistory.map((log) => (
                  <div
                    key={log.uploadId}
                    className="rounded-2xl bg-[#FAF9F5] p-4 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{log.fileName}</p>
                        <p className="mt-1 text-gray-600">{log.uploadedAt}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-[#E8F2EC] text-[#5F8C74]"
                            : "bg-[#FFF0EA] text-[#E07A5F]"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <p className="mt-2 text-gray-600">
                      처리 행 수: {log.insertedRows}
                    </p>

                    {log.failReason && (
                      <p className="mt-1 text-xs text-[#E07A5F]">
                        사유: {log.failReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 text-xs text-gray-500">
              💡 업로드 이력은 현재 세션에서만 유지됩니다.
            </p>
          </article>
        </section>
      </section>
    </main>
>>>>>>> feature/community-fe-setup
  );
}
