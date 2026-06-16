// src/pages/RegionEnergyDashboardPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartShareModal } from "../components/dashboard/ChartShareModal";

// 더미 데이터 - 추후 API 연동
const energyDataMock = [
  { month: "1월", consumption: 320, carbon: 145 },
  { month: "2월", consumption: 310, carbon: 140 },
  { month: "3월", consumption: 280, carbon: 126 },
  { month: "4월", consumption: 240, carbon: 108 },
  { month: "5월", consumption: 220, carbon: 99 },
  { month: "6월", consumption: 260, carbon: 117 },
  { month: "7월", consumption: 340, carbon: 153 },
];

export function RegionEnergyDashboardPage() {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState("부산 해운대구");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("05");
  const [selectedEnergy, setSelectedEnergy] = useState<"electric" | "gas">(
    "electric",
  );

  const [isShareOpen, setIsShareOpen] = useState(false);

  const filterCondition = `${selectedYear}년 ${selectedMonth}월 ${selectedRegion} ${
    selectedEnergy === "electric" ? "전기" : "가스"
  }`;

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">DASHBOARD</p>
            <h1 className="mt-2 text-3xl font-bold">지역별 에너지 대시보드</h1>
            <p className="mt-2 text-sm text-gray-600">
              지역과 기간을 선택해 에너지 소비량과 탄소 배출량 추이를
              확인하세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/compare")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              지역 비교 분석
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

        {/* 필터 */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">FILTER</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">지역:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-xl border border-[#E8F2EC] bg-white px-3 py-2 text-sm"
              >
                <option>부산 해운대구</option>
                <option>부산 수영구</option>
                <option>부산 남구</option>
                <option>서울 강남구</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">기간:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-xl border border-[#E8F2EC] bg-white px-3 py-2 text-sm"
              >
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-[#E8F2EC] bg-white px-3 py-2 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1}>{String(i + 1).padStart(2, "0")}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">에너지:</span>
              <button
                type="button"
                onClick={() => setSelectedEnergy("electric")}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                  selectedEnergy === "electric"
                    ? "bg-[#5F8C74] text-white"
                    : "border border-[#E8F2EC] bg-white text-gray-600"
                }`}
              >
                전기
              </button>
              <button
                type="button"
                onClick={() => setSelectedEnergy("gas")}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                  selectedEnergy === "gas"
                    ? "bg-[#5F8C74] text-white"
                    : "border border-[#E8F2EC] bg-white text-gray-600"
                }`}
              >
                가스
              </button>
            </div>
          </div>
        </section>

        {/* 면적 차트 */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">CONSUMPTION TREND</p>
          <h2 className="mt-2 text-xl font-bold">
            {selectedYear}년 {selectedRegion}{" "}
            {selectedEnergy === "electric" ? "전기" : "가스"} 소비량 추이
          </h2>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyDataMock}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F2EC" />
                <XAxis dataKey="month" stroke="#5F8C74" />
                <YAxis stroke="#5F8C74" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#5F8C74"
                  fill="#E8F2EC"
                  name="소비량 (kWh)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 막대 차트 */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">CARBON EMISSION</p>
          <h2 className="mt-2 text-xl font-bold">월별 탄소 배출량</h2>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyDataMock}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F2EC" />
                <XAxis dataKey="month" stroke="#5F8C74" />
                <YAxis stroke="#5F8C74" />
                <Tooltip />
                <Legend />
                <Bar dataKey="carbon" fill="#E07A5F" name="탄소 배출량 (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 액션 */}
        <section className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="rounded-2xl border border-[#5F8C74] bg-white px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            📧 이메일 리포트 구독
          </button>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="rounded-2xl bg-[#E07A5F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c8654d]"
          >
            🔗 차트 공유 링크 발급
          </button>
        </section>
      </section>

      {isShareOpen && (
        <ChartShareModal
          filterCondition={filterCondition}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </main>
  );
}
