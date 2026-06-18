// src/pages/Dashboard.tsx

import React, { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { fetchEnergySummary, createDashboardSnapshot } from "../api/dashboardApi";
import type { EnergyUsageSumResponse } from "../api/dashboardApi";
import { EnergyChart } from "../components/charts/EnergyChart";

export const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedRegion, setSelectedRegion] = useState<string>(""); // 빈 문자열이면 전국
  const [chartData, setChartData] = useState<EnergyUsageSumResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      const metadataStr = JSON.stringify(chartData);
      const regionLabel = selectedRegion || "전국 (모든 지역)";
      const title = `${regionLabel} ${selectedYear}년 에너지 소비 및 탄소 배출 분석`;
      
      const response = await createDashboardSnapshot({
        title,
        chartType: "BAR",
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
              <option value="2026">2026년</option>
              <option value="2025">2025년</option>
              <option value="2024">2024년</option>
              <option value="2023">2023년</option>
              <option value="2022">2022년</option>
              <option value="2021">2021년</option>
              <option value="2020">2020년</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2.5 bg-[#FAF9F5] border border-[#E8F2EC] rounded-2xl shadow-sm focus:outline-none focus:border-[#5F8C74] text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <option value="">전국 (모든 지역)</option>
              <option value="서울특별시 중구">서울특별시 중구</option>
              <option value="서울특별시 강남구">서울특별시 강남구</option>
              <option value="경기도 수원시">경기도 수원시</option>
            </select>
          </div>
        </div>

        {/* Summary Card (단일 열) */}
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

        {/* Main Chart Section */}
        {loading ? (
          <div className="h-96 bg-white border border-[#E8F2EC] rounded-3xl animate-pulse flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">실시간 전력 및 탄소 데이터 분석 중...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <EnergyChart data={chartData} />

            {/* 하단 공유 안내 카드 */}
            <div className="bg-white border border-[#E8F2EC] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-sm font-bold text-gray-800">
                  📢 이 멋진 대시보드를 커뮤니티에 자랑해보세요!
                </h4>
                <p className="text-gray-500 text-xs mt-1 max-w-lg leading-relaxed">
                  내가 설정한 필터의 차트 스냅샷 링크를 복사하여 에코 피플 커뮤니티 글에 삽입하면, 게시글 내에서 차트가 실시간 인터랙티브 위젯으로 살아납니다!
                </p>
              </div>

              <button
                onClick={handleShareSnapshot}
                className="px-5 py-3 rounded-2xl bg-[#5F8C74] hover:bg-[#4d735f] text-white font-bold transition text-xs shadow-sm cursor-pointer"
              >
                🔗 차트 스냅샷 공유하기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

