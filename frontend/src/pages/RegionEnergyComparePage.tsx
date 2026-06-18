// src/pages/RegionEnergyComparePage.tsx

import { useEffect, useState } from "react";
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

import {
  getEnergyCompare,
  type EnergyCompareResponse,
} from "../api/dashboardApi";

// 비교 가능한 지역 코드 매핑
const REGION_OPTIONS = [
  { code: "26350", name: "부산 해운대구 우동", isMyRegion: true },
  { code: "26351", name: "부산 해운대구 좌동", isMyRegion: false },
  { code: "26352", name: "부산 해운대구 중동", isMyRegion: false },
  { code: "26353", name: "부산 해운대구 송정동", isMyRegion: false },
];

const COLORS = ["#5F8C74", "#E07A5F", "#F2CC8F", "#81B29A"];

export function RegionEnergyComparePage() {
  const navigate = useNavigate();

  const [compareRegionCodes, setCompareRegionCodes] = useState<string[]>([
    "26350", // 내 거주지 (우동) 기본 선택
    "26351", // 좌동
  ]);

  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedEnergy, setSelectedEnergy] = useState<"ELECTRICITY" | "GAS">(
    "ELECTRICITY",
  );

  const [compareData, setCompareData] = useState<EnergyCompareResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 지역 토글 (내 거주지는 고정)
  const toggleRegion = (code: string) => {
    const region = REGION_OPTIONS.find((r) => r.code === code);
    if (region?.isMyRegion) return; // 내 거주지는 못 빼게

    setCompareRegionCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        // 최대 4개까지
        if (prev.length >= 4) {
          alert("최대 4개 지역까지 비교 가능합니다.");
          return prev;
        }
        return [...prev, code];
      }
    });
  };

  // 비교 데이터 가져오기
  useEffect(() => {
    const fetchCompareData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        if (compareRegionCodes.length === 0) {
          setCompareData(null);
          return;
        }

        const data = await getEnergyCompare(
          compareRegionCodes,
          selectedYear,
          selectedEnergy,
        );
        setCompareData(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("지역 비교 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompareData();
  }, [compareRegionCodes, selectedYear, selectedEnergy]);

  // 차트용 데이터 변환 (월별로 합치기)
  const chartData = (() => {
    if (!compareData || compareData.regions.length === 0) return [];

    // 모든 period(월) 수집
    const allPeriods = new Set<string>();
    compareData.regions.forEach((region) => {
      region.series.forEach((s) => allPeriods.add(s.period));
    });

    // 월별로 각 지역 데이터 합치기
    return Array.from(allPeriods)
      .sort()
      .map((period) => {
        const row: Record<string, string | number> = { period };
        compareData.regions.forEach((region) => {
          const found = region.series.find((s) => s.period === period);
          row[region.regionName] = found?.co2Kg ?? 0;
        });
        return row;
      });
  })();

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">COMPARE</p>
            <h1 className="mt-2 text-3xl font-bold">지역간 탄소 배출량 비교</h1>
            <p className="mt-2 text-sm text-gray-600">
              내 거주지와 다른 지역의 에너지 소비를 비교해보세요. (최대 4개)
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

        {/* 필터 */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">FILTER</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
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

        {/* 지역 선택 */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">비교 지역</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {REGION_OPTIONS.map((region) => {
              const isSelected = compareRegionCodes.includes(region.code);

              return (
                <button
                  key={region.code}
                  type="button"
                  onClick={() => toggleRegion(region.code)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    isSelected
                      ? region.isMyRegion
                        ? "bg-[#E8F2EC] text-[#5F8C74] ring-2 ring-[#5F8C74]"
                        : "bg-[#5F8C74] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {region.name}
                  {region.isMyRegion && " (내 거주지)"}
                </button>
              );
            })}
          </div>
        </section>

        {/* 로딩 / 에러 / 데이터 없음 */}
        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            지역 비교 정보를 불러오는 중...
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

        {!isLoading && !errorMessage && chartData.length > 0 && compareData && (
          <>
            {/* 비교 차트 */}
            <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#5F8C74]">
                MULTI LINE CHART
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {selectedYear}년{" "}
                {selectedEnergy === "ELECTRICITY" ? "전기" : "가스"} 탄소 배출량
                비교 (kg)
              </h2>

              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F2EC" />
                    <XAxis dataKey="period" stroke="#5F8C74" />
                    <YAxis stroke="#5F8C74" />
                    <Tooltip />
                    <Legend />
                    {compareData.regions.map((region, idx) => (
                      <Line
                        key={region.regionCode}
                        type="monotone"
                        dataKey={region.regionName}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* 분석 피드백 */}
            {compareData.insight && (
              <section className="rounded-3xl bg-[#E8F2EC] p-6 shadow-sm">
                <p className="text-sm font-bold text-[#5F8C74]">
                  💡 분석 피드백
                </p>

                <p className="mt-3 text-sm text-[#2C3531] leading-relaxed">
                  {compareData.insight}
                </p>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
