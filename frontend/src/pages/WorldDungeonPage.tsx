// src/pages/WorldDungeonPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentWorld, type WorldCurrentResponse } from "../api/worldApi";

import {
  getActiveDungeon,
  type ActiveDungeonResponse,
} from "../api/dungeonApi";

// 탄소 상태 한글 변환
function getGradeStatusLabel(status: string) {
  if (status === "PURIFIED") return "정화됨";
  if (status === "NORMAL") return "보통";
  if (status === "POLLUTED") return "오염됨";
  return "측정 중";
}

function getGradeStatusColor(status: string) {
  if (status === "PURIFIED") return "text-[#5F8C74]";
  if (status === "NORMAL") return "text-[#E07A5F]";
  if (status === "POLLUTED") return "text-red-600";
  return "text-gray-500";
}

// 남은 시간 포맷 (초 → "42분 30초")
function formatRemainingTime(seconds: number) {
  if (seconds <= 0) return "곧 종료";

  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;

  if (minutes > 0) {
    return `${minutes}분 ${sec}초`;
  }

  return `${sec}초`;
}

export function WorldDungeonPage() {
  const navigate = useNavigate();

  // 월드 상태
  const [world, setWorld] = useState<WorldCurrentResponse | null>(null);
  const [isWorldLoading, setIsWorldLoading] = useState(true);
  const [worldErrorMessage, setWorldErrorMessage] = useState("");

  // 활성 던전
  const [dungeon, setDungeon] = useState<ActiveDungeonResponse>(null);
  const [isDungeonLoading, setIsDungeonLoading] = useState(true);
  const [dungeonErrorMessage, setDungeonErrorMessage] = useState("");

  // 월드 상태 가져오기 (5초 폴링)
  useEffect(() => {
    const fetchWorld = async () => {
      try {
        const data = await getCurrentWorld();
        setWorld(data);
        setWorldErrorMessage("");
      } catch (error) {
        console.error(error);
        setWorldErrorMessage("월드 상태 정보를 불러오지 못했습니다.");
      } finally {
        setIsWorldLoading(false);
      }
    };

    fetchWorld();

    // 5초마다 새로 가져오기
    const intervalId = setInterval(fetchWorld, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // 활성 던전 가져오기 (30초 폴링)
  useEffect(() => {
    const fetchDungeon = async () => {
      try {
        const data = await getActiveDungeon();
        setDungeon(data);
        setDungeonErrorMessage("");
      } catch (error) {
        console.error(error);
        setDungeonErrorMessage("던전 정보를 불러오지 못했습니다.");
      } finally {
        setIsDungeonLoading(false);
      }
    };

    fetchDungeon();

    const intervalId = setInterval(fetchDungeon, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">WORLD DUNGEON</p>

            <h1 className="mt-2 text-3xl font-bold">월드 상태와 던전 이벤트</h1>

            <p className="mt-2 text-sm text-gray-600">
              전력 상태와 탄소 상태에 따라 특별 절전 던전이 열리는 화면입니다.
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

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* 월드 상태 카드 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">WORLD STATUS</p>

            {isWorldLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                월드 상태 정보를 불러오는 중...
              </div>
            )}

            {!isWorldLoading && worldErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {worldErrorMessage}
              </div>
            )}

            {!isWorldLoading && !worldErrorMessage && world && (
              <>
                <h2
                  className={`mt-2 text-2xl font-bold ${getGradeStatusColor(world.gradeStatus)}`}
                >
                  현재 상태: {getGradeStatusLabel(world.gradeStatus)}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  실시간 전력 데이터를 기반으로 한 우리 동네 환경 상태입니다.
                  (5초마다 자동 갱신)
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-[#FAF9F5] p-4">
                    <p className="text-sm text-gray-600">전력 예비율</p>
                    <p className="mt-1 text-2xl font-bold text-[#E07A5F]">
                      {world.reserveRate.toFixed(2)}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F5] p-4">
                    <p className="text-sm text-gray-600">탄소 집약도</p>
                    <p className="mt-1 text-2xl font-bold">
                      {world.carbonIntensity} gCO₂/kWh
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F5] p-4">
                    <p className="text-sm text-gray-600">보상 가중치</p>
                    <p className="mt-1 text-2xl font-bold text-[#E07A5F]">
                      ×{world.carbonWeight}
                    </p>
                  </div>
                </div>

                {/* 발전원 비율 */}
                {world.powerMix && world.powerMix.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-[#E8F2EC] p-4">
                    <p className="text-sm font-bold text-[#5F8C74]">
                      현재 발전원 비율
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      {world.powerMix.map((mix) => (
                        <div key={mix.source} className="flex justify-between">
                          <span className="text-gray-600">{mix.source}</span>
                          <span className="font-bold">
                            {(mix.ratio * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {world.isFallback && (
                  <p className="mt-2 text-xs text-gray-500">
                    ⚠️ 직전 데이터를 표시하고 있어요.
                  </p>
                )}
              </>
            )}
          </article>

          {/* 활성 던전 카드 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">ACTIVE DUNGEON</p>

            {isDungeonLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                던전 정보를 불러오는 중...
              </div>
            )}

            {!isDungeonLoading && dungeonErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {dungeonErrorMessage}
              </div>
            )}

            {/* 활성 던전이 있을 때 */}
            {!isDungeonLoading && !dungeonErrorMessage && dungeon && (
              <>
                <h2 className="mt-2 text-2xl font-bold text-[#E07A5F]">
                  🔥 던전 발령 중!
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  전력 피크 상황입니다. 던전 미션을 완료하면 보상이 2배예요!
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#FFF0EA] p-4">
                    <p className="text-sm text-gray-600">보상 배율</p>
                    <p className="mt-1 text-2xl font-bold text-[#E07A5F]">
                      ×{dungeon.dungeonMultiplier}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F5] p-4">
                    <p className="text-sm text-gray-600">미션 수</p>
                    <p className="mt-1 text-2xl font-bold">
                      {dungeon.missions.length}개
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F5] p-4">
                    <p className="text-sm text-gray-600">남은 시간</p>
                    <p className="mt-1 text-lg font-bold text-[#E07A5F]">
                      {formatRemainingTime(dungeon.remainingSeconds)}
                    </p>
                  </div>
                </div>

                {/* 추가 정보 */}
                <div className="mt-3 rounded-2xl bg-[#FAF9F5] p-3 text-xs text-gray-600">
                  <span>예비율: {dungeon.reserveRate.toFixed(2)}%</span>
                </div>

                {/* 던전 미션 목록 */}
                {dungeon.missions.length > 0 && (
                  <div className="mt-5 rounded-2xl bg-[#E8F2EC] p-4">
                    <p className="text-sm font-bold text-[#5F8C74]">
                      던전 미션 목록
                    </p>

                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      {dungeon.missions.map((mission) => (
                        <li key={mission.assignmentId}>
                          • {mission.title}
                          <span className="ml-2 text-xs text-[#E07A5F]">
                            (+{mission.baseReward}P · 예상{" "}
                            {mission.estimatedCo2Kg}kg 절감)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/missions")}
                  className="mt-5 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                >
                  미션 보러가기
                </button>
              </>
            )}

            {/* 활성 던전이 없을 때 */}
            {!isDungeonLoading && !dungeonErrorMessage && !dungeon && (
              <>
                <h2 className="mt-2 text-2xl font-bold text-[#5F8C74]">
                  😌 평온한 상태
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  현재 전력 상황이 안정적이에요. 평소처럼 미션을 진행해주세요.
                </p>

                <div className="mt-5 rounded-2xl bg-[#E8F2EC] p-4">
                  <p className="text-sm font-bold text-[#5F8C74]">
                    던전 발령 조건
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    전력 예비율이 10% 미만으로 떨어지면 던전이 자동으로
                    발령됩니다. 던전 발령 시 미션 보상이 2배가 돼요!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/missions")}
                  className="mt-5 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                >
                  일반 미션 보러가기
                </button>
              </>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
