// src/components/charts/EmbedChart.tsx

import React, { useEffect, useState } from "react";
import { fetchChartSnapshot, type ChartSnapshotResponse } from "../../api/communityApi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  
  // 비교 모드 전용 상태들
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [compareChartType, setCompareChartType] = useState<"LINE" | "BAR">("LINE");
  const [viewMetric, setViewMetric] = useState<"USAGE" | "CARBON">("USAGE");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadSnapshot() {
      try {
        setIsLoading(true);
        const data = await fetchChartSnapshot(snapshotId);
        setSnapshot(data);
        if (data.chartMetadata) {
          const parsed = JSON.parse(data.chartMetadata);
          
          if (parsed && !Array.isArray(parsed) && parsed.compareList) {
            // 다중 비교 차트 모드
            setIsCompareMode(true);
            setCompareList(parsed.compareList);
            setCompareChartType(parsed.type || "LINE");
          } else {
            // 단일 차트 모드
            setIsCompareMode(false);
            let rawData: any[] = [];
            if (parsed && !Array.isArray(parsed) && "data" in parsed) {
              rawData = parsed.data || [];
            } else if (Array.isArray(parsed)) {
              rawData = parsed;
            }

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

  if (isError || !snapshot || (chartData.length === 0 && compareList.length === 0)) {
    return (
      <div className="my-6 flex h-[200px] w-full flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 text-red-500">
        <span>⚠️ 차트를 불러올 수 없습니다. 유효하지 않은 스냅샷입니다.</span>
      </div>
    );
  }

  // 1~12월 데이터 가공 (비교 모드용)
  const compareChartData = Array.from({ length: 12 }, (_, i) => {
    const monthStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    const dataPoint: any = { month: `${i + 1}월` };

    compareList.forEach((item) => {
      const match = item.data.filter(
        (d: any) => d.usageYearMonth.endsWith(monthStr) && d.energyType === "ELECTRICITY"
      );
      const usage = match.reduce((sum: number, d: any) => sum + d.sumUsageAmount, 0);
      const carbon = match.reduce((sum: number, d: any) => sum + d.sumCarbonEmissionKg, 0);
      const val = viewMetric === "USAGE" ? usage : carbon;
      dataPoint[item.id] = Math.round(val * 10) / 10;
    });

    return dataPoint;
  });

  const unit = viewMetric === "USAGE" ? "kWh" : "kgCO₂eq";

  const CompareTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-3 rounded-2xl text-[10px] font-mono shadow-md border-0 z-50 animate-chart-text">
          <p className="font-bold border-b border-gray-700 pb-1 mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: p.stroke || p.fill }}
                />
                <span className="text-gray-300">{p.name}:</span>
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

  // 단일 차트 최대값 찾기 (높이 배율 연산용)
  const maxUsage = Math.max(...chartData.map((d) => d.totalPowerUsage), 100);

  return (
    <div className="my-6 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
      {/* 헤더 */}
      <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
        <div>
          <h4 className="text-sm font-bold text-gray-800">{snapshot.title || "에너지 사용량 비교 분석"}</h4>
          <p className="text-xs text-gray-500 mt-1">
            종류: {isCompareMode ? `비교 (${compareChartType === "LINE" ? "꺾은선" : "막대"})` : snapshot.chartType} • 생성시간: {snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleDateString() : ""}
          </p>
        </div>
        <span className="rounded-full bg-[#E8F2EC] px-3 py-1 text-[10px] font-bold text-[#5F8C74] uppercase tracking-wider border border-[#5F8C74]/10">
          Chart Snapshot
        </span>
      </div>

      {isCompareMode ? (
        <div className="space-y-4 animate-chart-text">
          {/* 미니 지표 토글 */}
          <div className="flex justify-end">
            <div className="bg-[#FAF9F5] p-0.5 rounded-xl flex border border-[#E8F2EC]">
              <button
                onClick={() => setViewMetric("USAGE")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  viewMetric === "USAGE" ? "bg-[#5F8C74] text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                사용량
              </button>
              <button
                onClick={() => setViewMetric("CARBON")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  viewMetric === "CARBON" ? "bg-[#5F8C74] text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                탄소배출량
              </button>
            </div>
          </div>
          
          <div className="h-64 w-full pr-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {compareChartType === "LINE" ? (
                <LineChart data={compareChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FAF9F5" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip content={<CompareTooltip />} />
                  <Legend verticalAlign="bottom" height={28} iconSize={6} wrapperStyle={{ fontSize: "9px", fontWeight: "bold" }} />
                  {compareList.map((item) => (
                    <Line
                      key={item.id}
                      type="monotone"
                      dataKey={item.id}
                      name={`${item.regionName} (${item.year}년)`}
                      stroke={item.color}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={compareChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FAF9F5" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip content={<CompareTooltip />} />
                  <Legend verticalAlign="bottom" height={28} iconSize={6} wrapperStyle={{ fontSize: "9px", fontWeight: "bold" }} />
                  {compareList.map((item) => (
                    <Bar
                      key={item.id}
                      dataKey={item.id}
                      name={`${item.regionName} (${item.year}년)`}
                      fill={item.color}
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};
