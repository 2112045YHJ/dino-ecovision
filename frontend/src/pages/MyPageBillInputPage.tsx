// src/pages/MyPageBillInputPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createMyBill } from "../api/mypageApi";

export function MyPageBillInputPage() {
  const navigate = useNavigate();

  const [billMonth, setBillMonth] = useState("");
  const [electricityKwh, setElectricityKwh] = useState("");
  const [electricityCost, setElectricityCost] = useState("");
  const [gasUsage, setGasUsage] = useState("");
  const [waterUsage, setWaterUsage] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!billMonth) {
      setErrorMessage("사용 월을 입력해주세요.");
      return;
    }

    if (!electricityKwh || Number(electricityKwh) < 0) {
      setErrorMessage("전기 사용량을 입력해주세요.");
      return;
    }

    if (!electricityCost || Number(electricityCost) < 0) {
      setErrorMessage("전기요금을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await createMyBill({
        billMonth,
        electricityKwh: Number(electricityKwh),
        electricityCost: Number(electricityCost),
        gasUsage: gasUsage ? Number(gasUsage) : undefined,
        waterUsage: waterUsage ? Number(waterUsage) : undefined,
      });

      setSuccessMessage("사용량 정보가 저장되었습니다.");
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "사용량 정보를 저장하지 못했습니다.";

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">BILL INPUT</p>

          <h1 className="mt-2 text-3xl font-bold">사용량 입력</h1>

          <p className="mt-2 text-sm text-gray-600">
            월별 전기 사용량과 요금을 입력해서 나의 사용 추이를 확인해요.
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-bold">사용 월</label>
          <input
            type="month"
            value={billMonth}
            onChange={(event) => {
              setBillMonth(event.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
          />

          <label className="mt-5 block text-sm font-bold">
            전기 사용량(kWh)
          </label>
          <input
            type="number"
            value={electricityKwh}
            onChange={(event) => {
              setElectricityKwh(event.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            placeholder="예: 250"
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
          />

          <label className="mt-5 block text-sm font-bold">전기요금(원)</label>
          <input
            type="number"
            value={electricityCost}
            onChange={(event) => {
              setElectricityCost(event.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            placeholder="예: 45000"
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
          />

          <label className="mt-5 block text-sm font-bold">
            도시가스 사용량
          </label>
          <input
            type="number"
            value={gasUsage}
            onChange={(event) => {
              setGasUsage(event.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            placeholder="선택 입력"
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
          />

          <label className="mt-5 block text-sm font-bold">수도 사용량</label>
          <input
            type="number"
            value={waterUsage}
            onChange={(event) => {
              setWaterUsage(event.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            placeholder="선택 입력"
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
          />

          {errorMessage && (
            <div className="mt-5 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-5 rounded-2xl bg-[#E8F2EC] p-4 text-sm font-bold text-[#5F8C74]">
              {successMessage}
            </div>
          )}

          <div className="mt-6 grid gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/mypage")}
              className="w-full rounded-2xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
            >
              마이페이지로 돌아가기
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
