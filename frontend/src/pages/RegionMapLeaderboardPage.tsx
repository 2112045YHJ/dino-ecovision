// src/pages/RegionMapLeaderboardPage.tsx

<<<<<<< HEAD
import { Header } from "../components/layout/Header";
import { regionRankingMock } from "../mocks/regionRankingMock";

export function RegionMapLeaderboardPage() {
  const topRegion = regionRankingMock[0];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">REGION RANKING</p>

          <h1 className="mt-1 text-3xl font-bold">지역 랭킹</h1>

          <p className="mt-1 text-sm text-gray-600">
            부산 지역별 참여자 수, 누적 포인트, 예상 탄소 절감량을 비교하는
            화면입니다.
          </p>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              TOP REGION
            </p>

            <h2 className="mt-2 text-2xl font-bold">{topRegion.regionName}</h2>

            <p className="mt-1 text-sm text-gray-500">
              {topRegion.participantCount}명 참여
            </p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              TOTAL POINT
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {topRegion.totalPoint} P
            </h2>

            <p className="mt-1 text-sm text-gray-500">지역 누적 점수</p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              REDUCTION
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {topRegion.reducedCarbonKg} kg
            </h2>

            <p className="mt-1 text-sm text-gray-500">예상 탄소 절감량</p>
          </article>
        </section>

        <section className="mb-6 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
            BUSAN MAP AREA
          </p>

          <div className="mt-4 flex min-h-[240px] items-center justify-center rounded-3xl bg-[#E8F2EC] p-6 text-center">
            <div>
              <p className="text-5xl">🗺️</p>

              <h2 className="mt-3 text-xl font-bold">지도 영역 준비 중</h2>

              <p className="mt-2 text-sm text-gray-600">
                현재는 카드형 지역 랭킹으로 먼저 구성했습니다. 추후 지도
                라이브러리 또는 부산 행정구역 데이터가 준비되면 지도 형태로
                교체할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {regionRankingMock.map((region) => (
            <article
              key={region.rank}
              className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#E07A5F]">
                    {region.rank}위
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {region.regionName}
                  </h2>
                </div>

                <span className="rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#5F8C74]">
                  {region.participantCount}명 참여
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FAF9F5] p-4">
                  <p className="text-xs text-gray-500">누적 포인트</p>

                  <p className="mt-1 text-xl font-bold">
                    {region.totalPoint} P
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF9F5] p-4">
                  <p className="text-xs text-gray-500">예상 절감량</p>

                  <p className="mt-1 text-xl font-bold">
                    {region.reducedCarbonKg} kg
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                주요 참여 미션: {region.mainMission}
              </p>
            </article>
          ))}
        </section>
      </main>
    </div>
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getRegionMapRanking,
  type RegionMapRankingResponse,
} from "../api/rankingApi";

export function RegionMapLeaderboardPage() {
  const navigate = useNavigate();

  const [regionRanking, setRegionRanking] =
    useState<RegionMapRankingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchRegionRanking = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getRegionMapRanking("national");
        setRegionRanking(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("지역 랭킹 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegionRanking();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">REGION RANKING</p>

            <h1 className="mt-2 text-3xl font-bold">지역 랭킹</h1>

            <p className="mt-2 text-sm text-gray-600">
              전국 지역별 탄소 절감량과 탄소 집약도를 비교하는 화면입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            홈으로 가기
          </button>
        </header>

        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            지역 랭킹 정보를 불러오는 중...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && regionRanking && (
          <>
            {/* TOP 지역 (지도 자리) */}
            <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#5F8C74]">TOP REGIONS</p>

              <h2 className="mt-2 text-xl font-bold">상위 지역 랭킹</h2>

              {regionRanking.topRegions.length === 0 ? (
                <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-3xl bg-[#E8F2EC] p-6 text-center">
                  <div>
                    <p className="text-4xl">🗺️</p>
                    <h3 className="mt-3 text-lg font-bold">
                      아직 지역 랭킹 정보가 없습니다
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      사용자들이 미션을 완료하면 지역별 탄소 절감량이 집계돼요!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {regionRanking.topRegions.map((region) => {
                    const isFirst = region.rank === 1;
                    const isTop3 = region.rank <= 3;

                    return (
                      <article
                        key={region.rank}
                        className={`rounded-2xl p-5 ${
                          isFirst
                            ? "bg-[#FFF8E8] ring-2 ring-[#E07A5F]"
                            : isTop3
                              ? "bg-[#E8F2EC] ring-1 ring-[#5F8C74]"
                              : "bg-[#FAF9F5]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-[#E07A5F]">
                            {region.rank === 1 && "🥇 "}
                            {region.rank === 2 && "🥈 "}
                            {region.rank === 3 && "🥉 "}
                            {region.rank}위
                          </p>
                        </div>

                        <h3 className="mt-2 text-lg font-bold">
                          {region.regionName}
                        </h3>

                        <div className="mt-3 rounded-xl bg-white p-3">
                          <p className="text-xs text-gray-600">절감 탄소량</p>
                          <p className="mt-1 text-xl font-bold text-[#5F8C74]">
                            {region.savedCarbonKg.toFixed(2)} kg
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 전체 지역 리스트 */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#5F8C74]">ALL REGIONS</p>

              <h2 className="mt-2 text-xl font-bold">
                전체 지역 ({regionRanking.regions.length}개)
              </h2>

              {regionRanking.regions.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-6 text-center text-sm font-bold text-gray-500">
                  아직 등록된 지역이 없습니다.
                </div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-2xl">
                  <div className="grid grid-cols-[1fr_120px_120px] gap-2 bg-[#E8F2EC] px-5 py-3 text-sm font-bold text-[#2C3531]">
                    <span>지역명</span>
                    <span className="text-right">절감 탄소량</span>
                    <span className="text-right">탄소 집약도</span>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {regionRanking.regions.map((region) => (
                      <div
                        key={region.regionCode}
                        className="grid grid-cols-[1fr_120px_120px] gap-2 border-t border-gray-100 bg-white px-5 py-3 text-sm hover:bg-[#FAF9F5]"
                      >
                        <span className="font-bold">{region.regionName}</span>
                        <span className="text-right font-bold text-[#5F8C74]">
                          {region.savedCarbonKg.toFixed(2)} kg
                        </span>
                        <span className="text-right text-gray-600">
                          {region.intensity.toFixed(2)} g/kWh
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs text-gray-500">
                💡 탄소 집약도가 낮을수록 친환경 발전 비중이 높은 지역입니다.
              </p>
            </section>
          </>
        )}
      </section>
    </main>
>>>>>>> feature/community-fe-setup
  );
}
