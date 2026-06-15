// src/pages/MyPageTrendChartPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyBillTrend, type BillTrendItem } from "../api/mypageApi";

function getMaxKwh(items: BillTrendItem[]) {
  const values = items.map((item) => item.electricityKwh ?? 0);
  return Math.max(...values, 1);
}

export function MyPageTrendChartPage() {
  const navigate = useNavigate();

  const [trendItems, setTrendItems] = useState<BillTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMyBillTrend();

        setTrendItems(data);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "사용량 추이를 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrend();
  }, []);

  const maxKwh = getMaxKwh(trendItems);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">MY TREND</p>

            <h1 className="mt-2 text-3xl font-bold">사용량 추이</h1>

            <p className="mt-2 text-sm text-gray-600">
              내가 입력한 월별 전기 사용량 변화를 확인해요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            마이페이지로 이동
          </button>
        </header>

        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            사용량 추이를 불러오는 중입니다...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && trendItems.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            아직 입력된 사용량 정보가 없습니다.
          </div>
        )}

        {!isLoading && !errorMessage && trendItems.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">월별 전기 사용량</p>

            <div className="mt-6 space-y-4">
              {trendItems.map((item) => {
                const kwh = item.electricityKwh ?? 0;
                const percent = Math.round((kwh / maxKwh) * 100);

                return (
                  <div key={item.billMonth}>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span>{item.billMonth}</span>
                      <span>{kwh} kWh</span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-[#E8F2EC]">
                      <div
                        className="h-full rounded-full bg-[#5F8C74]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      전기요금: {item.electricityCost ?? 0}원 / 예상 CO₂:{" "}
                      {item.estimatedCo2Kg ?? 0}kg
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
