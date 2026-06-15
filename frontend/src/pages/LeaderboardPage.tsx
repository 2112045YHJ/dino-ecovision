// src/pages/LeaderboardPage.tsx

import { useNavigate } from "react-router-dom";

import { userRankingMock } from "../mocks/rankingMock";

export function LeaderboardPage() {
  const navigate = useNavigate();

  const topUser = userRankingMock[0];

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">LEADERBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">개인 랭킹</h1>

            <p className="mt-2 text-sm text-gray-600">
              미션 참여 점수와 예상 탄소 절감량을 기준으로 사용자 순위를
              보여줍니다.
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

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">1위 사용자</p>
            <h2 className="mt-2 text-2xl font-bold">{topUser.nickname}</h2>
            <p className="mt-1 text-sm text-gray-600">{topUser.regionName}</p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">최고 점수</p>
            <h2 className="mt-2 text-2xl font-bold">{topUser.point} P</h2>
            <p className="mt-1 text-sm text-gray-600">
              미션 완료와 퀴즈 보상 기준
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">예상 절감량</p>
            <h2 className="mt-2 text-2xl font-bold">
              {topUser.reducedCarbonKg} kgCO₂e
            </h2>
            <p className="mt-1 text-sm text-gray-600">누적 탄소 절감량</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="grid grid-cols-[70px_1fr_1fr_100px_120px] gap-2 bg-[#E8F2EC] px-5 py-3 text-sm font-bold text-[#2C3531]">
            <span>순위</span>
            <span>닉네임</span>
            <span>지역</span>
            <span className="text-right">포인트</span>
            <span className="text-right">절감량</span>
          </div>

          {userRankingMock.map((user) => (
            <div
              key={user.rank}
              className="grid grid-cols-[70px_1fr_1fr_100px_120px] gap-2 border-t border-gray-100 px-5 py-4 text-sm"
            >
              <span className="font-bold text-[#E07A5F]">{user.rank}위</span>
              <span className="font-bold">{user.nickname}</span>
              <span className="text-gray-600">{user.regionName}</span>
              <span className="text-right font-bold">{user.point} P</span>
              <span className="text-right text-gray-600">
                {user.reducedCarbonKg} kg
              </span>
            </div>
          ))}
        </section>

        <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm">
          현재는 더미데이터 기준 화면입니다. 나중에 랭킹 API가 연결되면 이
          영역을 실제 사용자 랭킹으로 교체하면 됩니다.
        </p>
      </section>
    </main>
  );
}
