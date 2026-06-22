// src/pages/Dashboard.tsx

import React, { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { fetchEnergySummary, createDashboardSnapshot, resetAndFetchEnergyData, fetchFilterOptions } from "../api/dashboardApi";
import type { EnergyUsageSumResponse } from "../api/dashboardApi";
import { EnergyChart } from "../components/charts/EnergyChart";
import { CompareChart } from "../components/charts/CompareChart";
import type { CompareItem } from "../components/charts/CompareChart";

export const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedRegion, setSelectedRegion] = useState<string>(""); // 빈 문자열이면 전국
  const [chartData, setChartData] = useState<EnergyUsageSumResponse[]>([]);
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [compareChartType, setCompareChartType] = useState<"LINE" | "BAR">("LINE");
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{ years: string[]; regions: string[] }>({
    years: ["2025"],
    regions: [],
  });

  const handleAddCompare = () => {
    const regionName = selectedRegion || "전국 (모든 지역)";
    const id = `${selectedYear}-${selectedRegion || "all"}`;

    if (compareList.some((item) => item.id === id)) {
      showToast("이미 비교 목록에 추가된 차트입니다. ⚠️");
      return;
    }

    if (compareList.length >= 5) {
      showToast("최대 5개 지역까지만 비교할 수 있습니다. ⚠️");
      return;
    }

    const colors = ["#5F8C74", "#E07A5F", "#F2CC8F", "#3F6C8E", "#8B5CF6"];
    const assignedColor = colors[compareList.length];

    const newItem: CompareItem = {
      id,
      year: selectedYear,
      regionCode: selectedRegion || "1111000000",
      regionName,
      data: chartData,
      color: assignedColor,
    };

    setCompareList([...compareList, newItem]);
    showToast(`비교 목록에 '${regionName} (${selectedYear}년)'을(를) 추가했습니다! ➕`);
  };

  const handleRemoveCompare = (id: string) => {
    const updated = compareList.filter((item) => item.id !== id);
    const colors = ["#5F8C74", "#E07A5F", "#F2CC8F", "#3F6C8E", "#8B5CF6"];
    const recolored = updated.map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length],
    }));
    setCompareList(recolored);
    showToast("비교 대상이 삭제되었습니다.");
  };

  // 필터 옵션 로드
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const options = await fetchFilterOptions();
        setFilterOptions(options);
        
        if (options.years.length > 0 && !options.years.includes(selectedYear)) {
          setSelectedYear(options.years[0]);
        }
      } catch (err) {
        console.error("필터 옵션 로드 실패", err);
      }
    };
    loadFilters();
  }, []);

  const handleResetAndFetch = async () => {
    const confirmMsg = "DB의 모든 데이터를 제거하고 로컬 개발/테스트용 모의 데이터를 적재하시겠습니까?";
    
    if (!window.confirm(confirmMsg)) return;
    setIsResetting(true);
    showToast("DB를 초기화하고 모의 데이터를 적재합니다... ⏳");
    try {
      const msg = await resetAndFetchEnergyData(true);
      showToast("성공: " + msg + " 🎉");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showToast("실패: " + (err.message || "오류가 발생했습니다."));
      setIsResetting(false);
    }
  };

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 전국일 때는 백엔드에 '1111000000' (전국 대용) 전달
        const apiRegionCode = selectedRegion || "1111000000";
        const data = await fetchEnergySummary(selectedYear, apiRegionCode);
        setChartData(data);
      } catch (err) {
        console.error("데이터 로드 중 에러 발생", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedYear, selectedRegion]);

  // 공유하기 (차트 스냅샷 복사)
  const handleShareSnapshot = async () => {
    try {
      let metadataStr = "";
      let title = "";
      let chartTypeStr = "";

      if (compareList.length > 0) {
        // 비교 모드 공유
        metadataStr = JSON.stringify({
          type: compareChartType,
          compareList: compareList.map((item) => ({
            id: item.id,
            year: item.year,
            regionCode: item.regionCode,
            regionName: item.regionName,
            data: item.data,
            color: item.color,
          })),
        });
        const regionLabels = compareList
          .map((item) => `${item.regionName} (${item.year}년)`)
          .join(", ");
        title = `${regionLabels} 에너지 비교 분석`;
        chartTypeStr = "COMPARE";
      } else {
        // 단일 차트 공유 (기존 하위 호환)
        metadataStr = JSON.stringify(chartData);
        const regionLabel = selectedRegion || "전국 (모든 지역)";
        title = `${regionLabel} ${selectedYear}년 에너지 소비 및 탄소 배출 분석`;
        chartTypeStr = "BAR";
      }

      const response = await createDashboardSnapshot({
        title,
        chartType: chartTypeStr,
        chartMetadata: metadataStr,
      });

      const embedUrl = `${window.location.origin}/embed/${response.id}`;
      await navigator.clipboard.writeText(embedUrl);
      
      showToast("차트 스냅샷 URL이 클립보드에 복사되었습니다! 🚀");
    } catch (err) {
      console.error("스냅샷 생성 실패", err);
      showToast("링크 복사에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 연간 총 전력 사용량 계산 (energyType === "ELECTRICITY"인 항목들의 sumUsageAmount 누적 합산)
  const totalPower = chartData
    ?.filter((item) => item.energyType === "ELECTRICITY")
    ?.reduce((sum, item) => sum + (item.sumUsageAmount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531] pb-12">
      {/* 상단 글로벌 네비게이션 바 */}
      <Header />

      {/* 토스트 팝업 알림 */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-xl animate-bounce z-50 text-xs font-semibold">
          ✨ {toastMessage}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8F2EC] shadow-sm">
          <div>
            <div
              className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 cursor-pointer hover:text-[#5F8C74] transition-colors"
              onClick={() => window.history.back()}
            >
              ← 홈으로 돌아가기
            </div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📊 에너지 전력 대시보드
            </h1>
            <p className="text-xs text-gray-500 mt-1">지역별 월별 전력 사용량 추이 분석</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddCompare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF9F5] border border-[#E8F2EC] hover:bg-[#E8F2EC] text-[#5F8C74] rounded-2xl shadow-sm transition-colors text-xs font-bold cursor-pointer"
            >
              ➕ 비교 추가
            </button>
            <button
              onClick={handleShareSnapshot}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5F8C74] hover:bg-[#4d735f] text-white rounded-2xl shadow-sm transition-colors text-xs font-bold cursor-pointer"
            >
              🔗 공유하기
            </button>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2.5 bg-[#FAF9F5] border border-[#E8F2EC] rounded-2xl shadow-sm focus:outline-none focus:border-[#5F8C74] text-xs font-semibold text-gray-700 cursor-pointer"
            >
              {filterOptions.years.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2.5 bg-[#FAF9F5] border border-[#E8F2EC] rounded-2xl shadow-sm focus:outline-none focus:border-[#5F8C74] text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <option value="">전국 (모든 지역)</option>
              {filterOptions.regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 비교 차트 리스트 칩 목록 */}
        {compareList.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-[#E8F2EC] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-500">⚔️ 비교 차트 리스트 ({compareList.length}/5)</h4>
              <button 
                onClick={() => setCompareList([])}
                className="text-[10px] font-bold text-[#FAF9F5] bg-red-400 hover:bg-red-500 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                전체 초기화
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {compareList.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all duration-300"
                  style={{ 
                    borderColor: `${item.color}30`, 
                    backgroundColor: `${item.color}10`,
                    color: item.color 
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.regionName} ({item.year}년)
                  <button 
                    onClick={() => handleRemoveCompare(item.id)}
                    className="ml-1 hover:text-red-500 font-extrabold cursor-pointer text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Card (단일 열 또는 다중 비교 열) */}
        {compareList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {compareList.map((item) => {
              const total = item.data
                ?.filter((d) => d.energyType === "ELECTRICITY")
                ?.reduce((sum, d) => sum + (d.sumUsageAmount || 0), 0) || 0;
              return (
                <div 
                  key={item.id} 
                  className="bg-white p-5 rounded-3xl border border-[#E8F2EC] shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5 duration-300"
                >
                  <div 
                    className="p-3 rounded-2xl text-xl shrink-0 font-bold" 
                    style={{ backgroundColor: `${item.color}10`, color: item.color }}
                  >
                    ⚡
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 truncate">{item.regionName} ({item.year}년)</p>
                    <p className="text-base font-extrabold mt-0.5" style={{ color: item.color }}>
                      {total.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[10px] font-normal text-gray-500">kWh</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1">
            {loading ? (
              <div className="h-32 bg-white border border-[#E8F2EC] rounded-3xl animate-pulse flex items-center justify-center">
                <span className="text-xs text-gray-400 font-medium">데이터를 분석하는 중...</span>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl border border-[#E8F2EC] shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5 duration-300">
                <div className="p-4 bg-[#E8F2EC] rounded-2xl text-2xl text-[#5F8C74]">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">연간 총 전력 사용량</p>
                  <p className="text-2xl font-extrabold text-gray-800 mt-1">
                    {totalPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                    <span className="text-sm font-normal text-gray-500">kWh</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Chart Section */}
        {loading ? (
          <div className="h-96 bg-white border border-[#E8F2EC] rounded-3xl animate-pulse flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">실시간 전력 및 탄소 데이터 분석 중...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="bg-white border border-[#E8F2EC] rounded-3xl p-12 text-center shadow-sm">
            <span className="text-4xl">📭</span>
            <h3 className="text-base font-bold text-gray-800 mt-4">분석 데이터가 존재하지 않습니다</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed mb-6">
              현재 DB에 적재된 실시간 에너지 사용량 정보가 없습니다.<br />
              API 인증키가 정상적으로 등록되었는지 확인하거나, 수집 배치를 기다려 주세요.
            </p>
            <button
              onClick={handleResetAndFetch}
              disabled={isResetting}
              className="px-5 py-3 rounded-2xl bg-[#5F8C74] hover:bg-[#4d735f] text-white font-bold transition text-xs shadow-sm cursor-pointer disabled:bg-gray-300"
            >
              💡 개발용 모의 데이터 적재하기
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {compareList.length > 0 ? (
              <CompareChart
                compareList={compareList}
                chartType={compareChartType}
                onChartTypeChange={setCompareChartType}
              />
            ) : (
              <EnergyChart data={chartData} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

