// src/pages/LeaderboardPage.tsx

import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { userRankingMock } from "../mocks/rankingMock";

export function LeaderboardPage() {
  const navigate = useNavigate();

  const topUser = userRankingMock[0];
  const totalReducedCarbon = userRankingMock.reduce(
    (sum, user) => sum + user.reducedCarbonKg,
    0,
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">LEADERBOARD</p>

          <h1 className="mt-1 text-3xl font-bold text-[#2C3531]">에코 랭킹</h1>

          <p className="mt-1 text-sm text-gray-600">
            미션 참여 점수와 예상 탄소 절감량을 기준으로 사용자 순위를 확인할 수
            있어요.
          </p>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              TOP USER
            </p>

            <h2 className="mt-2 text-2xl font-bold">{topUser.nickname}</h2>

            <p className="mt-1 text-sm text-gray-500">{topUser.regionName}</p>

            <p className="mt-3 rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#5F8C74]">
              {topUser.level}
            </p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              HIGHEST POINT
            </p>

            <h2 className="mt-2 text-2xl font-bold">{topUser.point} P</h2>

            <p className="mt-1 text-sm text-gray-500">
              미션 완료와 퀴즈 보상 기준
            </p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              TOTAL REDUCTION
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {totalReducedCarbon.toFixed(1)} kg
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              랭킹 사용자 예상 절감량 합계
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
                USER RANKING
              </p>

              <h2 className="mt-1 text-xl font-bold">개인 랭킹 TOP 5</h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/region-ranking")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2 text-xs font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              지역 랭킹 보기
            </button>
          </div>

          <div className="space-y-3">
            {userRankingMock.map((user) => (
              <article
                key={user.rank}
                className="flex flex-col gap-3 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${
                      user.rank === 1
                        ? "bg-[#E07A5F] text-white"
                        : "bg-[#E8F2EC] text-[#5F8C74]"
                    }`}
                  >
                    {user.rank}
                  </div>

                  <div>
                    <h3 className="font-bold">{user.nickname}</h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {user.regionName} · {user.level}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-right text-xs md:min-w-[300px]">
                  <div>
                    <p className="text-gray-500">포인트</p>
                    <p className="mt-1 font-bold text-[#5F8C74]">
                      {user.point} P
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">절감량</p>
                    <p className="mt-1 font-bold">{user.reducedCarbonKg} kg</p>
                  </div>

                  <div>
                    <p className="text-gray-500">미션</p>
                    <p className="mt-1 font-bold">
                      {user.completedMissionCount}개
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/guild")}
            className="rounded-3xl border border-[#E8F2EC] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              GUILD
            </p>
            <h2 className="mt-2 text-lg font-bold">지역 길드 보기</h2>
            <p className="mt-2 text-sm text-gray-600">
              같은 지역 사용자들의 길드 점수와 기여도를 확인해요.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/world-dungeon")}
            className="rounded-3xl border border-[#E8F2EC] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              WORLD DUNGEON
            </p>
            <h2 className="mt-2 text-lg font-bold">월드/던전 상태 보기</h2>
            <p className="mt-2 text-sm text-gray-600">
              전력 예비율과 던전 이벤트 상태를 확인해요.
            </p>
          </button>
        </section>

        <p className="mt-4 rounded-2xl bg-white p-4 text-xs text-gray-500 shadow-sm">
          현재는 API 연결 전 더미데이터 화면입니다. 나중에 랭킹 API가 준비되면
          `rankingMock` 부분만 API 호출로 교체하면 됩니다.
        </p>
      </main>
    </div>
  );
}
