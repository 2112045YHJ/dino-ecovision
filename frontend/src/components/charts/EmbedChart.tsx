// src/components/charts/EmbedChart.tsx

import React, { useEffect, useState } from "react";
import { fetchChartSnapshot, type ChartSnapshotResponse } from "../../api/communityApi";

interface EmbedChartProps {
  snapshotId: string;
}

interface ChartDataPoint {
  month: number;
  totalPowerUsage: number;
  totalCarbonEmission: number;
}

export const EmbedChart: React.FC<EmbedChartProps> = ({ snapshotId }) => {
  const [snapshot, setSnapshot] = useState<ChartSnapshotResponse | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadSnapshot() {
      try {
        setIsLoading(true);
        const data = await fetchChartSnapshot(snapshotId);
        setSnapshot(data);
        if (data.chartMetadata) {
          const rawData = JSON.parse(data.chartMetadata) as any[];
          if (rawData && rawData.length > 0 && rawData[0].usageYearMonth !== undefined) {
            const processed = Array.from({ length: 12 }, (_, i) => {
              const monthStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
              
              // 전기 사용량 합산
              const electricityMatch = rawData.filter(
                (item) => item.usageYearMonth.endsWith(monthStr) && item.energyType === "ELECTRICITY"
              );
              const powerUsage = electricityMatch.reduce((sum, item) => sum + (item.sumUsageAmount || 0), 0);
              
              // 전체(전기+가스) 탄소 배출량 합산
              const allMatch = rawData.filter(
                (item) => item.usageYearMonth.endsWith(monthStr)
              );
              const carbonEmission = allMatch.reduce((sum, item) => sum + (item.sumCarbonEmissionKg || 0), 0);
              
              return {
                month: i + 1,
                totalPowerUsage: Math.round(powerUsage * 10) / 10,
                totalCarbonEmission: Math.round(carbonEmission * 10) / 10,
              };
            });
            setChartData(processed);
          } else {
            setChartData(rawData as ChartDataPoint[]);
          }
        }
      } catch (err) {
        console.error("Failed to load chart snapshot:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadSnapshot();
  }, [snapshotId]);

  if (isLoading) {
    return (
      <div className="my-6 flex h-[280px] w-full flex-col items-center justify-center rounded-3xl border border-[#E8F2EC] bg-[#FAF9F5] text-gray-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5F8C74] border-t-transparent"></div>
        <span className="mt-2 text-xs font-semibold">차트 데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (isError || !snapshot || chartData.length === 0) {
    return (
      <div className="my-6 flex h-[200px] w-full flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 text-red-500">
        <span>⚠️ 차트를 불러올 수 없습니다. 유효하지 않은 스냅샷입니다.</span>
      </div>
    );
  }

  // 차트 최대값 찾기 (높이 배율 연산용)
  const maxUsage = Math.max(...chartData.map((d) => d.totalPowerUsage), 100);

  return (
    <div className="my-6 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
      {/* 헤더 */}
      <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
        <div>
          <h4 className="text-sm font-bold text-gray-800">{snapshot.title || "에너지 사용량 비교 분석"}</h4>
          <p className="text-xs text-gray-500 mt-1">종류: {snapshot.chartType} • 생성시간: {snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleDateString() : ""}</p>
        </div>
        <span className="rounded-full bg-[#E8F2EC] px-3 py-1 text-[10px] font-bold text-[#5F8C74] uppercase tracking-wider border border-[#5F8C74]/10">
          Chart Snapshot
        </span>
      </div>

      {/* 차트 영역 (표준 CSS/Tailwind 바 차트) */}
      <div className="flex h-[180px] items-end justify-between gap-3 px-4">
        {chartData.map((data, index) => {
          const heightPercent = (data.totalPowerUsage / maxUsage) * 100;
          return (
            <div key={index} className="group relative flex flex-1 flex-col items-center h-full justify-end">
              {/* 호버 툴팁 */}
              <div className="absolute bottom-full mb-2 hidden flex-col items-center group-hover:flex">
                <div className="rounded bg-gray-800 px-2 py-1 text-[10px] font-medium text-white shadow-md">
                  <div>사용량: {data.totalPowerUsage} kWh</div>
                  <div>배출량: {data.totalCarbonEmission} kg</div>
                </div>
                <div className="-mt-1 h-2 w-2 rotate-45 bg-gray-800"></div>
              </div>

              {/* 막대 바 */}
              <div
                className="w-full rounded-t-lg bg-[#5F8C74] transition-all duration-500 group-hover:bg-[#4d735f] shadow-sm"
                style={{ height: `${Math.max(heightPercent, 8)}%` }}
              ></div>

              {/* 하단 월 라벨 */}
              <span className="mt-2 text-[10px] font-bold text-gray-500">{data.month}월</span>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="mt-4 flex justify-center gap-4 border-t border-gray-50 pt-4 text-[10px] font-bold text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-[#5F8C74]"></span>
          <span>전력 사용량 (kWh)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-[#E07A5F]"></span>
          <span>탄소 배출량 (kgCO₂)</span>
        </div>
      </div>
    </div>
  );
};
