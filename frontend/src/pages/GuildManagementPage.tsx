// src/pages/GuildManagementPage.tsx

import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { guildRankingMock, myGuildMock } from "../mocks/guildMock";

export function GuildManagementPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">GUILD</p>

          <h1 className="mt-1 text-3xl font-bold">지역 길드</h1>

          <p className="mt-1 text-sm text-gray-600">
            같은 지역 사용자들이 함께 미션을 수행하고 길드 점수를 쌓는
            화면입니다.
          </p>
        </header>

        <section className="mb-6 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
                MY GUILD
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {myGuildMock.guildName}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {myGuildMock.regionName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/leaderboard")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2 text-xs font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              개인 랭킹 보기
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-xs text-gray-500">길드원</p>
              <p className="mt-1 text-xl font-bold">
                {myGuildMock.memberCount}명
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-xs text-gray-500">길드 점수</p>
              <p className="mt-1 text-xl font-bold">
                {myGuildMock.totalPoint} P
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-xs text-gray-500">예상 절감량</p>
              <p className="mt-1 text-xl font-bold">
                {myGuildMock.reducedCarbonKg} kg
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF1EC] p-4">
              <p className="text-xs text-gray-500">내 기여 순위</p>
              <p className="mt-1 text-xl font-bold text-[#E07A5F]">
                {myGuildMock.myRankInGuild}위
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
            GUILD RANKING
          </p>

          <h2 className="mt-1 text-xl font-bold">길드 랭킹</h2>

          <div className="mt-4 space-y-3">
            {guildRankingMock.map((guild) => (
              <article
                key={guild.rank}
                className="flex flex-col gap-3 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold ${
                      guild.rank === 1
                        ? "bg-[#E07A5F] text-white"
                        : "bg-[#E8F2EC] text-[#5F8C74]"
                    }`}
                  >
                    {guild.rank}
                  </div>

                  <div>
                    <h3 className="font-bold">{guild.guildName}</h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {guild.regionName} · {guild.memberCount}명 참여
                    </p>
                  </div>
                </div>

                <div className="text-sm md:text-right">
                  <p className="font-bold text-[#5F8C74]">
                    {guild.totalPoint} P
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {guild.reducedCarbonKg} kgCO₂e 절감
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    주요 미션: {guild.mainMission}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-4 rounded-2xl bg-white p-4 text-xs text-gray-500 shadow-sm">
          현재는 API 연결 전 더미데이터 화면입니다. 나중에 길드 API가 준비되면
          `guildMock` 부분만 API 호출로 교체하면 됩니다.
        </p>
      </main>
    </div>
  );
}
