// src/components/charts/EnergyChart.tsx

import React, { useState } from "react";
import type { EnergyUsageSumResponse } from "../../api/dashboardApi";

interface EnergyChartProps {
  data: EnergyUsageSumResponse[];
}

export const EnergyChart: React.FC<EnergyChartProps> = ({ data }) => {
  const activeTab = "ELECTRICITY";
  const [viewMetric, setViewMetric] = useState<"USAGE" | "CARBON">("USAGE");

  // 1~12월 데이터로 가공
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    // 해당하는 월 및 타입의 데이터를 필터링
    const match = data.filter(
      (item) => item.usageYearMonth.endsWith(monthStr) && item.energyType === activeTab
    );
    
    const usage = match.reduce((sum, item) => sum + item.sumUsageAmount, 0);
    const carbon = match.reduce((sum, item) => sum + item.sumCarbonEmissionKg, 0);

    return {
      month: `${i + 1}월`,
      usage: Math.round(usage * 10) / 10,
      carbon: Math.round(carbon * 10) / 10,
    };
  });

  // 최대값 산출 (높이 비율 계산용)
  const maxUsage = Math.max(...monthlyData.map((d) => d.usage), 10);
  const maxCarbon = Math.max(...monthlyData.map((d) => d.carbon), 10);
  const maxVal = viewMetric === "USAGE" ? maxUsage : maxCarbon;

  // 단위 설정
  const unit = activeTab === "ELECTRICITY" 
    ? (viewMetric === "USAGE" ? "kWh" : "kgCO₂eq") 
    : (viewMetric === "USAGE" ? "m³" : "kgCO₂eq");

  // Y축 눈금선 (5단계 분할)
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const val = Math.round((maxVal * (4 - i)) / 4);
    return val;
  });

  return (
    <div className="bg-white border border-[#E8F2EC] rounded-3xl p-6 shadow-sm transition-all duration-300">
      {/* 차트 상단 컨트롤 영역 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📊 지역 에너지 분석 통계
            <span key={viewMetric} className="text-[10px] font-bold text-[#5F8C74] bg-[#E8F2EC] px-2 py-0.5 rounded-full animate-chart-text inline-block">
              {unit}
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            월별 전력 사용량 및 온실가스 배출량 비교 분석
          </p>
        </div>

        {/* 토글 스위치들 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 지표 토글 */}
          <div className="bg-[#FAF9F5] p-1 rounded-2xl flex border border-[#E8F2EC]">
            <button
              onClick={() => setViewMetric("USAGE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-350 cursor-pointer ${
                viewMetric === "USAGE"
                  ? "bg-[#5F8C74] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              사용량
            </button>
            <button
              onClick={() => setViewMetric("CARBON")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-350 cursor-pointer ${
                viewMetric === "CARBON"
                  ? "bg-[#5F8C74] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              탄소배출량
            </button>
          </div>
        </div>
      </div>

      {/* 차트 렌더링 영역 */}
      <div className="relative flex items-stretch h-72 md:h-80 w-full mt-4">
        {/* Y축 수치 라벨 */}
        <div 
          key={viewMetric}
          className="flex flex-col justify-between text-[11px] text-gray-400 text-right pr-3 w-16 select-none font-mono animate-chart-text"
        >
          {gridLines.map((line, idx) => (
            <span key={idx}>{line.toLocaleString()}</span>
          ))}
        </div>

        {/* 그리드 백그라운드 & 막대 렌더링 컨테이너 */}
        <div className="relative flex-1 overflow-x-auto scrollbar-none border-l border-b border-[#E8F2EC] min-w-[500px]">
          {/* 가로 그리드선 */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-full border-t border-[#FAF9F5] ${idx === 4 ? "invisible" : ""}`}
              />
            ))}
          </div>

          {/* 막대 정렬 영역 */}
          <div className="absolute inset-0 flex justify-around items-end px-2 pt-10">
            {monthlyData.map((d, idx) => {
              const val = viewMetric === "USAGE" ? d.usage : d.carbon;
              const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
              const tooltipAlignClass = idx === 0 
                ? "left-0" 
                : idx === 11 
                  ? "right-0" 
                  : "left-1/2 -translate-x-1/2";

              return (
                <div key={idx} className="group relative flex flex-col items-center w-full max-w-[40px] h-full justify-end">
                  {/* 툴팁 마우스오버 */}
                  <div className={`absolute bottom-full mb-2 ${tooltipAlignClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gray-800 text-white px-3 py-1.5 rounded-xl text-[10px] font-mono text-center shadow-md z-20 whitespace-nowrap`}>
                    <div className="font-bold text-gray-300">{d.month}</div>
                    <div className="font-bold mt-0.5 text-white">
                      {val.toLocaleString()} {unit}
                    </div>
                  </div>

                  {/* 세로 막대 (Tailwind Div) */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-5 md:w-6 rounded-t-lg transition-all duration-500 transform origin-bottom hover:scale-x-110 shadow-sm relative ${
                      activeTab === "ELECTRICITY"
                        ? "bg-gradient-to-t from-[#5F8C74] to-[#7EA993] hover:from-[#4d735f] hover:to-[#5F8C74]"
                        : "bg-gradient-to-t from-[#E07A5F] to-[#F29F80] hover:from-[#c8654d] hover:to-[#E07A5F]"
                    }`}
                  >
                    {/* 막대 내부 라이트 반사 효과 */}
                    <div className="absolute inset-y-0 left-0 w-[2px] bg-white/20 rounded-l-lg pointer-events-none" />
                  </div>

                  {/* X축 라벨 */}
                  <span className="text-[11px] text-gray-500 mt-2 select-none group-hover:text-gray-700 transition-colors font-semibold">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

