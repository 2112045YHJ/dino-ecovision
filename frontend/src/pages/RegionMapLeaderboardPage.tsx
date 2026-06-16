// src/pages/RegionMapLeaderboardPage.tsx

import { useNavigate } from "react-router-dom";

import { regionRankingMock } from "../mocks/regionRankingMock";

export function RegionMapLeaderboardPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">REGION RANKING</p>

            <h1 className="mt-2 text-3xl font-bold">지역 랭킹</h1>

            <p className="mt-2 text-sm text-gray-600">
              부산 지역별 참여자 수, 누적 포인트, 예상 탄소 절감량을 비교하는
              화면입니다.
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

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">BUSAN MAP AREA</p>

          <div className="mt-4 flex min-h-65 items-center justify-center rounded-3xl bg-[#E8F2EC] p-6 text-center">
            <div>
              <p className="text-4xl">🗺️</p>

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
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#E07A5F]">
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
                  <p className="text-sm text-gray-600">누적 포인트</p>
                  <p className="mt-1 text-xl font-bold">
                    {region.totalPoint} P
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF9F5] p-4">
                  <p className="text-sm text-gray-600">예상 절감량</p>
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
      </section>
    </main>
  );
}
