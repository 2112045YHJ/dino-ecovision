// src/pages/AdminCsvUploadPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { uploadLogsMock } from "../mocks/adminMock";

export function AdminCsvUploadPage() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadType, setUploadType] = useState("ENERGY_USAGE");

  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (file?: File) => {
    if (!file) {
      setSelectedFile(null);
      setSelectedFileName("");
      return;
    }

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

      // TODO: 실제 업로드 API 연결 시 아래 주석을 교체하세요.
      // const formData = new FormData();
      // formData.append("file", selectedFile);
      // formData.append("uploadType", uploadType);
      // await uploadCsv(formData);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage(
        `${selectedFileName} 파일이 성공적으로 업로드되었습니다. (시뮬레이션)`,
      );
      setSelectedFile(null);
      setSelectedFileName("");
    } catch (error) {
      console.error(error);
      setErrorMessage("업로드에 실패했습니다. 파일 형식을 확인해주세요.");
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
                onChange={(event) => {
                  setUploadType(event.target.value);
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
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
              현재는 시뮬레이션 모드입니다. 실제 API 연결 시 FormData로 파일을
              전송하면 됩니다.
            </p>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">UPLOAD LOG</p>

            <h2 className="mt-2 text-xl font-bold">업로드 이력</h2>

            <div className="mt-4 space-y-3">
              {uploadLogsMock.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl bg-[#FAF9F5] p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{log.fileName}</p>
                      <p className="mt-1 text-gray-600">
                        {log.uploadType} · {log.uploadedAt}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        log.status === "SUCCESS"
                          ? "bg-[#E8F2EC] text-[#5F8C74]"
                          : log.status === "FAILED"
                            ? "bg-[#FFF0EA] text-[#E07A5F]"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <p className="mt-2 text-gray-600">
                    처리 행 수: {log.rowCount}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
