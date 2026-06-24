// src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import {
  createDashboardSnapshot,
  fetchEnergySummary,
  fetchFilterOptions,
  resetAndFetchEnergyData,
  type EnergyUsageSumResponse,
} from "../api/dashboardApi";
import {
  CompareChart,
  type CompareItem,
} from "../components/charts/CompareChart";
import { EnergyChart } from "../components/charts/EnergyChart";
import { fetchChartSnapshot } from "../api/communityApi";
import { copyToClipboard } from "../utils/clipboard";

export const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [chartData, setChartData] = useState<EnergyUsageSumResponse[]>([]);
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [compareChartType, setCompareChartType] = useState<"LINE" | "BAR">(
    "LINE",
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{
    years: string[];
    regions: string[];
  }>({
    years: ["2025"],
    regions: [],
  });

  const queryParams = new URLSearchParams(window.location.search);
  const snapshotId = queryParams.get("snapshotId");
  const [isRestoring, setIsRestoring] = useState<boolean>(!!snapshotId);

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 스냅샷 복원 처리
  useEffect(() => {
    const restoreSnapshot = async () => {
      if (!snapshotId) return;
      try {
        setLoading(true);
        const snapshot = await fetchChartSnapshot(snapshotId);
        const parsed = JSON.parse(snapshot.chartMetadata);

        if (snapshot.chartType === "COMPARE") {
          // 비교 모드 복원
          if (parsed.compareList) {
            setCompareList(parsed.compareList);
          }
          if (parsed.type) {
            setCompareChartType(parsed.type);
          }
        } else {
          // 단일 차트 복원
          if (parsed && typeof parsed === "object" && "data" in parsed) {
            // 신규 객체 포맷 { isCompare, year, regionCode, data }
            setSelectedYear(parsed.year || "2025");
            setSelectedRegion(parsed.regionCode || "");
            setChartData(parsed.data || []);
          } else if (Array.isArray(parsed)) {
            // 구버전 배열 포맷
            setChartData(parsed);
          }
        }
      } catch (err) {
        console.error("스냅샷 복원 실패", err);
        showToast("공유된 차트 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
        setIsRestoring(false);
      }
    };

    if (snapshotId) {
      restoreSnapshot();
    }
  }, [snapshotId]);

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
    showToast(
      `비교 목록에 '${regionName} (${selectedYear}년)'을 추가했습니다.`,
    );
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

  const handleResetAndFetch = async () => {
    const confirmMsg =
      "DB의 모든 데이터를 제거하고 로컬 개발/테스트용 모의 데이터를 적재하시겠습니까?";

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

  const handleShareSnapshot = async () => {
    try {
      let metadataStr = "";
      let title = "";
      let chartTypeStr = "";

      if (compareList.length > 0) {
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
        // 단일 차트 공유 (신규 규격)
        metadataStr = JSON.stringify({
          isCompare: false,
          year: selectedYear,
          regionCode: selectedRegion,
          data: chartData
        });
        const regionLabel = selectedRegion || "전국 (모든 지역)";
        title = `${regionLabel} ${selectedYear}년 에너지 소비 및 탄소 배출 분석`;
        chartTypeStr = "BAR";
      }

      const response = await createDashboardSnapshot({
        title,
        chartType: chartTypeStr,
        chartMetadata: metadataStr,
        isSaved: false,
      });

      const embedUrl = `${window.location.origin}/embed/${response.id}`;
      const success = await copyToClipboard(embedUrl);

      if (success) {
        showToast("차트 스냅샷 URL이 클립보드에 복사되었습니다! 🚀");
      } else {
        showToast("링크 복사에 실패했습니다. 브라우저 설정을 확인해 주세요.");
      }
    } catch (err) {
      console.error("스냅샷 생성 실패", err);
      showToast("링크 복사에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSaveChartSnapshot = async () => {
    try {
      let metadataStr = "";
      let title = "";
      let chartTypeStr = "";

      if (compareList.length > 0) {
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
        // 단일 차트 저장 (신규 규격)
        metadataStr = JSON.stringify({
          isCompare: false,
          year: selectedYear,
          regionCode: selectedRegion,
          data: chartData
        });
        const regionLabel = selectedRegion || "전국 (모든 지역)";
        title = `${regionLabel} ${selectedYear}년 에너지 소비 및 탄소 배출 분석`;
        chartTypeStr = "BAR";
      }

      await createDashboardSnapshot({
        title,
        chartType: chartTypeStr,
        chartMetadata: metadataStr,
        isSaved: true,
      });

      showToast("차트가 내 보관함에 성공적으로 저장되었습니다! 💾");
    } catch (err) {
      console.error("스냅샷 저장 실패", err);
      showToast("차트 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

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

  useEffect(() => {
    const loadData = async () => {
      // 복원 중인 경우에만 단일 조회를 스킵합니다.
      if (isRestoring) return;

      setLoading(true);

      try {
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
  }, [selectedYear, selectedRegion, isRestoring]);

  const totalPower =
    chartData
      ?.filter((item) => item.energyType === "ELECTRICITY")
      ?.reduce((sum, item) => sum + (item.sumUsageAmount || 0), 0) || 0;

  const hasData = chartData.length > 0;
  const selectedRegionLabel = selectedRegion || "전국";

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-12 text-[#2C3531]">
      <Header />

      {toastMessage && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-full bg-gray-800 px-6 py-3 text-xs font-semibold text-white shadow-xl">
          ✨ {toastMessage}
        </div>
      )}

      <main className="mx-auto mt-8 max-w-5xl space-y-6 px-6">
        {/* 상단 대시보드 헤더 */}
        <header className="rounded-[28px] border border-[#E8F2EC] bg-white px-7 py-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="mb-3 text-xs font-medium text-gray-500 transition hover:text-[#5F8C74]"
              >
                ← 홈으로 돌아가기
              </button>

              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F2EC] text-2xl">
                  📊
                </span>

                <div>
                  <h1 className="text-3xl font-bold leading-tight text-[#1F2D2A]">
                    에너지 전력 대시보드
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    지역별 월별 전력 사용량 추이 분석
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#EEF3EF] pt-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-11 rounded-2xl border border-[#DDEBE3] bg-[#FAF9F5] px-4 text-sm font-medium text-[#2C3531] shadow-sm outline-none transition focus:border-[#5F8C74] focus:bg-white"
                >
                  {filterOptions.years.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="h-11 min-w-[190px] rounded-2xl border border-[#DDEBE3] bg-[#FAF9F5] px-4 text-sm font-medium text-[#2C3531] shadow-sm outline-none transition focus:border-[#5F8C74] focus:bg-white"
                >
                  <option value="">전국 (모든 지역)</option>
                  {filterOptions.regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddCompare}
                  className="h-11 rounded-2xl border border-[#DDEBE3] bg-white px-4 text-sm font-bold text-[#5F8C74] shadow-sm transition hover:border-[#5F8C74] hover:bg-[#E8F2EC]"
                >
                  ＋ 비교 추가
                </button>

                <button
                  type="button"
                  onClick={handleSaveChartSnapshot}
                  className="h-11 rounded-2xl border border-[#DDEBE3] bg-white px-4 text-sm font-bold text-[#5F8C74] shadow-sm transition hover:border-[#5F8C74] hover:bg-[#E8F2EC]"
                >
                  💾 차트 저장
                </button>

                <button
                  type="button"
                  onClick={handleShareSnapshot}
                  className="h-11 rounded-2xl bg-[#5F8C74] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4d735f]"
                >
                  🔗 링크 복사
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 비교 차트 리스트 */}
        {compareList.length > 0 && (
          <section className="rounded-[28px] border border-[#E8F2EC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#5F8C74]">
                비교 차트 리스트 ({compareList.length}/5)
              </h2>

              <button
                type="button"
                onClick={() => setCompareList([])}
                className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-100"
              >
                전체 초기화
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {compareList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold"
                  style={{
                    borderColor: `${item.color}30`,
                    backgroundColor: `${item.color}10`,
                    color: item.color,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.regionName} ({item.year}년)
                  <button
                    type="button"
                    onClick={() => handleRemoveCompare(item.id)}
                    className="ml-1 text-[10px] font-extrabold hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 요약 카드 */}
        {compareList.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {compareList.map((item) => {
              const total =
                item.data
                  ?.filter((d) => d.energyType === "ELECTRICITY")
                  ?.reduce((sum, d) => sum + (d.sumUsageAmount || 0), 0) || 0;

              return (
                <article
                  key={item.id}
                  className="flex items-center gap-4 rounded-[24px] border border-[#E8F2EC] bg-white p-5 shadow-sm transition hover:-translate-y-0.5"
                >
                  <div
                    className="shrink-0 rounded-2xl p-3 text-xl font-bold"
                    style={{
                      backgroundColor: `${item.color}10`,
                      color: item.color,
                    }}
                  >
                    ⚡
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-gray-500">
                      {item.regionName} ({item.year}년)
                    </p>
                    <p
                      className="mt-1 text-lg font-extrabold"
                      style={{ color: item.color }}
                    >
                      {total.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        kWh
                      </span>
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-3">
            {loading ? (
              <article className="h-32 rounded-[24px] border border-[#E8F2EC] bg-white p-6 shadow-sm">
                <div className="h-full animate-pulse rounded-2xl bg-[#FAF9F5]" />
              </article>
            ) : (
              <>
                <article className="rounded-[24px] border border-[#E8F2EC] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F2EC] text-2xl">
                      ⚡
                    </span>

                    <div>
                      <p className="text-sm font-bold text-[#5F8C74]">
                        연간 총 전력 사용량
                      </p>
                      <p className="mt-1 text-2xl font-extrabold text-[#1F2D2A]">
                        {totalPower.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          kWh
                        </span>
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[24px] border border-[#E8F2EC] bg-white p-6 shadow-sm">
                  <p className="text-sm font-bold text-[#5F8C74]">선택 지역</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#1F2D2A]">
                    {selectedRegionLabel}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedYear}년 기준
                  </p>
                </article>

                <article className="rounded-[24px] border border-[#E8F2EC] bg-white p-6 shadow-sm">
                  <p className="text-sm font-bold text-[#5F8C74]">
                    데이터 상태
                  </p>
                  <p
                    className={`mt-3 text-2xl font-extrabold ${
                      hasData ? "text-[#5F8C74]" : "text-[#E07A5F]"
                    }`}
                  >
                    {hasData ? "분석 가능" : "대기 중"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {hasData
                      ? "차트를 확인할 수 있어요."
                      : "데이터 적재가 필요해요."}
                  </p>
                </article>
              </>
            )}
          </section>
        )}

        {/* 메인 차트 영역 */}
        {loading ? (
          <section className="flex h-96 items-center justify-center rounded-[28px] border border-[#E8F2EC] bg-white shadow-sm">
            <span className="text-sm font-medium text-gray-400">
              실시간 전력 및 탄소 데이터 분석 중...
            </span>
          </section>
        ) : (compareList.length === 0 && chartData.length === 0) ? (
          <section className="rounded-[28px] border border-dashed border-[#DDEBE3] bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F2EC] text-3xl">
              📭
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#1F2D2A]">
              분석 데이터가 아직 없습니다
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              현재 DB에 적재된 실시간 에너지 사용량 정보가 없습니다.
              <br />
              API 인증키가 정상적으로 등록되었는지 확인하거나, 수집 배치를
              기다려 주세요.
            </p>

            <button
              type="button"
              onClick={handleResetAndFetch}
              disabled={isResetting}
              className="mt-6 rounded-2xl bg-[#5F8C74] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4d735f] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              💡 개발용 모의 데이터 적재하기
            </button>
          </section>
        ) : (
          <section className="space-y-6">
            {compareList.length > 0 ? (
              <CompareChart
                compareList={compareList}
                chartType={compareChartType}
                onChartTypeChange={setCompareChartType}
              />
            ) : (
              <EnergyChart data={chartData} />
            )}
          </section>
        )}
      </main>
    </div>
  );
};
