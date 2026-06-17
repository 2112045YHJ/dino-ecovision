// src/pages/RegionEnergyComparePage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const compareDataMock = [
  { month: "1월", 우동: 145, 좌동: 168, 중동: 152 },
  { month: "2월", 우동: 140, 좌동: 162, 중동: 148 },
  { month: "3월", 우동: 126, 좌동: 148, 중동: 135 },
  { month: "4월", 우동: 108, 좌동: 128, 중동: 118 },
  { month: "5월", 우동: 99, 좌동: 122, 중동: 110 },
  { month: "6월", 우동: 117, 좌동: 138, 중동: 125 },
  { month: "7월", 우동: 153, 좌동: 178, 중동: 165 },
];

export function RegionEnergyComparePage() {
  const navigate = useNavigate();

  const [compareRegions, setCompareRegions] = useState<string[]>([
    "우동",
    "좌동",
  ]);

  const availableRegions = ["우동", "좌동", "중동", "송정동"];

  const toggleRegion = (region: string) => {
    if (region === "우동") return; // 내 거주지는 고정

    setCompareRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region],
    );
  };

  const colors = ["#5F8C74", "#E07A5F", "#F2CC8F", "#81B29A"];

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">COMPARE</p>
            <h1 className="mt-2 text-3xl font-bold">지역간 탄소 배출량 비교</h1>
            <p className="mt-2 text-sm text-gray-600">
              내 거주지와 다른 지역의 에너지 소비를 비교해보세요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            대시보드로 가기
          </button>
        </header>

        {/* 지역 선택 */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">비교 지역군</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {availableRegions.map((region) => {
              const isSelected = compareRegions.includes(region);
              const isMyRegion = region === "우동";

              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    isSelected
                      ? isMyRegion
                        ? "bg-[#E8F2EC] text-[#5F8C74] ring-2 ring-[#5F8C74]"
                        : "bg-[#5F8C74] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  부산 해운대구 {region}
                  {isMyRegion && " (내 거주지)"}
                </button>
              );
            })}
          </div>
        </section>

        {/* 비교 차트 */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">MULTI LINE CHART</p>
          <h2 className="mt-2 text-xl font-bold">월별 탄소 배출량 비교 (kg)</h2>

          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={compareDataMock}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F2EC" />
                <XAxis dataKey="month" stroke="#5F8C74" />
                <YAxis stroke="#5F8C74" />
                <Tooltip />
                <Legend />
                {compareRegions.map((region, idx) => (
                  <Line
                    key={region}
                    type="monotone"
                    dataKey={region}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 분석 피드백 */}
        <section className="rounded-3xl bg-[#E8F2EC] p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">💡 분석 피드백</p>

          <p className="mt-3 text-sm text-[#2C3531] leading-relaxed">
            현재 <strong>우동</strong>의 1인당 가스 소비량 탄소 배출이 인접한{" "}
            <strong>좌동</strong> 대비 약 <strong>14.2% 적게</strong> 배출되고
            있습니다. 우수한 성과입니다!
          </p>
        </section>
      </section>
    </main>
  );
}
