// src/pages/RegionEnergyDashboardPage.tsx

import { useEffect, useState } from "react";
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

import { getEnergyStats, type EnergyStatsResponse } from "../api/dashboardApi";

import { ChartShareModal } from "../components/dashboard/ChartShareModal";

// 지역 코드 매핑
const REGION_OPTIONS = [
  { code: "26350", name: "부산 해운대구" },
  { code: "26260", name: "부산 수영구" },
  { code: "26290", name: "부산 남구" },
  { code: "11680", name: "서울 강남구" },
];

export function RegionEnergyDashboardPage() {
  const navigate = useNavigate();

  // 필터 상태
  const [selectedRegionCode, setSelectedRegionCode] = useState("26350");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined,
  );
  const [selectedEnergy, setSelectedEnergy] = useState<"ELECTRICITY" | "GAS">(
    "ELECTRICITY",
  );

  // API 데이터 상태
  const [energyStats, setEnergyStats] = useState<EnergyStatsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isShareOpen, setIsShareOpen] = useState(false);

  // 필터 변경 시 API 호출
  useEffect(() => {
    const fetchEnergyStats = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getEnergyStats(
          selectedRegionCode,
          selectedYear,
          selectedMonth,
          selectedEnergy,
        );
        setEnergyStats(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("에너지 통계 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnergyStats();
  }, [selectedRegionCode, selectedYear, selectedMonth, selectedEnergy]);

  // 차트용 데이터 변환
  const chartData =
    energyStats?.series.map((item) => ({
      period: item.period,
      usage: item.usage ?? 0,
      co2Kg: item.co2Kg,
    })) ?? [];

  // 선택된 지역 이름
  const selectedRegionName =
    REGION_OPTIONS.find((r) => r.code === selectedRegionCode)?.name ??
    "알 수 없음";

  const filterCondition = `${selectedYear}년 ${
    selectedMonth ? `${selectedMonth}월` : "전체"
  } ${selectedRegionName} ${
    selectedEnergy === "ELECTRICITY" ? "전기" : "가스"
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
                value={selectedRegionCode}
                onChange={(e) => setSelectedRegionCode(e.target.value)}
                className="rounded-xl border border-[#E8F2EC] bg-white px-3 py-2 text-sm"
              >
                {REGION_OPTIONS.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">연도:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-xl border border-[#E8F2EC] bg-white px-3 py-2 text-sm"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">월:</span>
              <select
                value={selectedMonth ?? ""}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className="rounded-xl border border-[#E8F2EC] bg-white px-3 py-2 text-sm"
              >
                <option value="">전체</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {String(i + 1).padStart(2, "0")}월
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">에너지:</span>
              <button
                type="button"
                onClick={() => setSelectedEnergy("ELECTRICITY")}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                  selectedEnergy === "ELECTRICITY"
                    ? "bg-[#5F8C74] text-white"
                    : "border border-[#E8F2EC] bg-white text-gray-600"
                }`}
              >
                전기
              </button>
              <button
                type="button"
                onClick={() => setSelectedEnergy("GAS")}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                  selectedEnergy === "GAS"
                    ? "bg-[#5F8C74] text-white"
                    : "border border-[#E8F2EC] bg-white text-gray-600"
                }`}
              >
                가스
              </button>
            </div>
          </div>
        </section>

        {/* 로딩 / 에러 / 데이터 없음 */}
        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            에너지 통계 정보를 불러오는 중...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && chartData.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            선택한 조건에 해당하는 데이터가 없습니다.
          </div>
        )}

        {!isLoading && !errorMessage && chartData.length > 0 && (
          <>
            {/* 면적 차트 */}
            <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#5F8C74]">
                CONSUMPTION TREND
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {selectedYear}년 {selectedRegionName}{" "}
                {selectedEnergy === "ELECTRICITY" ? "전기" : "가스"} 소비량 추이
              </h2>

              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F2EC" />
                    <XAxis dataKey="period" stroke="#5F8C74" />
                    <YAxis stroke="#5F8C74" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stroke="#5F8C74"
                      fill="#E8F2EC"
                      name={`사용량 (${selectedEnergy === "ELECTRICITY" ? "kWh" : "m³"})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* 막대 차트 */}
            <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#5F8C74]">
                CARBON EMISSION
              </p>
              <h2 className="mt-2 text-xl font-bold">월별 탄소 배출량</h2>

              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F2EC" />
                    <XAxis dataKey="period" stroke="#5F8C74" />
                    <YAxis stroke="#5F8C74" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="co2Kg"
                      fill="#E07A5F"
                      name="탄소 배출량 (kg)"
                    />
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
          </>
        )}
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
