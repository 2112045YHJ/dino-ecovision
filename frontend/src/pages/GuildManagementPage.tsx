// src/pages/GuildManagementPage.tsx

import { useNavigate } from "react-router-dom";

import { guildRankingMock, myGuildMock } from "../mocks/guildMock";

export function GuildManagementPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">GUILD</p>

            <h1 className="mt-2 text-3xl font-bold">지역 길드</h1>

            <p className="mt-2 text-sm text-gray-600">
              같은 지역 사용자들이 함께 미션을 수행하고 길드 점수를 쌓는
              공간입니다.
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
          <p className="text-sm font-bold text-[#5F8C74]">MY GUILD</p>

          <h2 className="mt-2 text-2xl font-bold">{myGuildMock.guildName}</h2>

          <p className="mt-1 text-sm text-gray-600">{myGuildMock.regionName}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-sm text-gray-600">길드원</p>
              <p className="mt-1 text-xl font-bold">
                {myGuildMock.memberCount}명
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-sm text-gray-600">길드 점수</p>
              <p className="mt-1 text-xl font-bold">
                {myGuildMock.totalPoint} P
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-sm text-gray-600">예상 절감량</p>
              <p className="mt-1 text-xl font-bold">
                {myGuildMock.reducedCarbonKg} kg
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-sm text-gray-600">내 기여 점수</p>
              <p className="mt-1 text-xl font-bold text-[#E07A5F]">
                {myGuildMock.myContributionPoint} P
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">GUILD RANKING</p>

          <h2 className="mt-2 text-xl font-bold">길드 랭킹</h2>

          <div className="mt-4 space-y-3">
            {guildRankingMock.map((guild) => (
              <article
                key={guild.rank}
                className="flex flex-col gap-2 rounded-2xl bg-[#FAF9F5] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-[#E07A5F]">
                    {guild.rank}위
                  </p>

                  <h3 className="mt-1 font-bold">{guild.guildName}</h3>

                  <p className="mt-1 text-sm text-gray-600">
                    {guild.regionName} · {guild.memberCount}명
                  </p>
                </div>

                <div className="text-sm md:text-right">
                  <p className="font-bold">{guild.totalPoint} P</p>
                  <p className="text-gray-600">
                    {guild.reducedCarbonKg} kgCO₂e 절감
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm">
          현재는 더미데이터 기준 화면입니다. 나중에 길드 API가 연결되면 내 지역
          길드 정보와 길드 랭킹을 실제 데이터로 교체하면 됩니다.
        </p>
      </section>
    </main>
  );
}
