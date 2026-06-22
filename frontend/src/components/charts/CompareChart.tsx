// src/components/charts/CompareChart.tsx

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EnergyUsageSumResponse } from "../../api/dashboardApi";

export interface CompareItem {
  id: string;          // "year-regionCode"
  year: string;
  regionCode: string;
  regionName: string;
  data: EnergyUsageSumResponse[];
  color: string;
}

interface CompareChartProps {
  compareList: CompareItem[];
}

export const CompareChart: React.FC<CompareChartProps> = ({ compareList }) => {
  const [viewMetric, setViewMetric] = useState<"USAGE" | "CARBON">("USAGE");
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    setIsAnimate(false);
    const timer = setTimeout(() => {
      setIsAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [viewMetric, compareList]);

  // 1~12월 데이터로 변환 가공
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const monthStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    const dataPoint: any = { month: `${i + 1}월` };

    compareList.forEach((item) => {
      // 해당하는 월 및 타입(전기 고정)의 데이터를 필터링
      const match = item.data.filter(
        (d) => d.usageYearMonth.endsWith(monthStr) && d.energyType === "ELECTRICITY"
      );
      
      const usage = match.reduce((sum, d) => sum + d.sumUsageAmount, 0);
      const carbon = match.reduce((sum, d) => sum + d.sumCarbonEmissionKg, 0);
      
      const val = viewMetric === "USAGE" ? usage : carbon;
      dataPoint[item.id] = Math.round(val * 10) / 10;
    });

    return dataPoint;
  });

  const unit = viewMetric === "USAGE" ? "kWh" : "kgCO₂eq";

  // 커스텀 툴팁 구성
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-3.5 rounded-2xl text-[11px] font-mono shadow-lg border-0 z-50 animate-chart-text">
          <p className="font-extrabold border-b border-gray-700 pb-1 mb-2 text-gray-300">
            📊 {label} 상세 비교
          </p>
          <div className="space-y-1.5">
            {payload.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: p.stroke }}
                />
                <span className="text-gray-400 font-semibold">{p.name}:</span>
                <span className="font-extrabold text-white">
                  {p.value.toLocaleString()} {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#E8F2EC] rounded-3xl p-6 shadow-sm transition-all duration-300">
      {/* 차트 상단 컨트롤 영역 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            ⚔️ 지역 간 에너지 비교 분석
            <span
              key={viewMetric}
              className="text-[10px] font-bold text-[#5F8C74] bg-[#E8F2EC] px-2 py-0.5 rounded-full animate-chart-text inline-block"
            >
              {unit}
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            추가된 지역별 월별 전력 사용량 및 온실가스 배출량 통합 분석
          </p>
        </div>

        {/* 지표 토글 */}
        <div className="bg-[#FAF9F5] p-1 rounded-2xl flex border border-[#E8F2EC] self-start md:self-auto">
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

      {/* Recharts 그래프 렌더링 영역 */}
      <div className="h-80 md:h-96 w-full mt-4 pr-4">
        {isAnimate ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#FAF9F5" />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E8F2EC" }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E8F2EC" }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#2C3531",
                  paddingTop: "15px",
                }}
              />
              {compareList.map((item) => (
                <Line
                  key={item.id}
                  type="monotone"
                  dataKey={item.id}
                  name={`${item.regionName} (${item.year}년)`}
                  stroke={item.color}
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">비교 그래프 분석 데이터를 준비하는 중...</span>
          </div>
        )}
      </div>
    </div>
  );
};
