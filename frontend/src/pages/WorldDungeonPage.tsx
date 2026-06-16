// src/pages/WorldDungeonPage.tsx

import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";
import {
  activeDungeonMock,
  dungeonMissionMock,
  worldStatusMock,
} from "../mocks/worldDungeonMock";

export function WorldDungeonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">WORLD DUNGEON</p>

          <h1 className="mt-1 text-3xl font-bold">월드 상태와 던전 이벤트</h1>

          <p className="mt-1 text-sm text-gray-600">
            전력 상태와 탄소 상태에 따라 특별 절전 던전이 열리는 화면입니다.
          </p>
        </header>

        <section className="mb-6 rounded-3xl bg-[#E07A5F] p-5 text-white shadow-sm">
          <p className="text-xs font-bold tracking-wider">DUNGEON ALERT</p>

          <h2 className="mt-1 text-lg font-bold">
            {activeDungeonMock.title} 진행 중
          </h2>

          <p className="mt-2 text-sm opacity-90">
            보상 배율 x{activeDungeonMock.bonusMultiplier} · 진행 시간{" "}
            {activeDungeonMock.startTime}~{activeDungeonMock.endTime}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              WORLD STATUS
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              현재 상태: {worldStatusMock.statusLabel}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {worldStatusMock.message}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-[#FAF9F5] p-4">
                <p className="text-xs text-gray-500">전력 예비율</p>

                <p className="mt-1 text-2xl font-bold text-[#E07A5F]">
                  {worldStatusMock.reserveRate}%
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF9F5] p-4">
                <p className="text-xs text-gray-500">탄소 집약도</p>

                <p className="mt-1 text-2xl font-bold">
                  {worldStatusMock.carbonIntensity} gCO₂/kWh
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              추후 `/api/world/current` API가 생기면 실제 전력/탄소 상태로
              교체하면 됩니다.
            </p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              ACTIVE DUNGEON
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {activeDungeonMock.title}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {activeDungeonMock.description}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#FFF1EC] p-4">
                <p className="text-xs text-gray-500">보상 배율</p>

                <p className="mt-1 text-2xl font-bold text-[#E07A5F]">
                  x{activeDungeonMock.bonusMultiplier}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF9F5] p-4">
                <p className="text-xs text-gray-500">미션 수</p>

                <p className="mt-1 text-2xl font-bold">
                  {activeDungeonMock.missionCount}개
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF9F5] p-4">
                <p className="text-xs text-gray-500">진행 시간</p>

                <p className="mt-1 text-lg font-bold">
                  {activeDungeonMock.startTime}~{activeDungeonMock.endTime}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#E8F2EC] p-4">
              <p className="text-sm font-bold text-[#5F8C74]">추천 던전 미션</p>

              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {dungeonMissionMock.map((mission) => (
                  <li key={mission}>• {mission}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => navigate("/missions")}
              className="mt-5 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4d735f]"
            >
              미션 보러가기
            </button>

            <p className="mt-4 text-xs text-gray-500">
              추후 `/api/dungeons/active` API가 생기면 실제 던전 이벤트로
              교체하면 됩니다.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
