// src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { getMyDino, type MyDinoResponse } from "../api/dinoApi";
import { getTodayMissions } from "../api/missionApi";
import { getCurrentWorld, type WorldCurrentResponse } from "../api/worldApi";
import {
  getActiveDungeon,
  type ActiveDungeonResponse,
} from "../api/dungeonApi";

import { EcoQuizModal } from "../components/quiz/EcoQuizModal";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

import type { Mission } from "../types/mission";

/* =========================
   공룡 안전 처리 함수
   ========================= */

function getSafeDinoType(dino?: MyDinoResponse | null): DinoType {
  const templateCode = String(dino?.templateCode ?? "").toUpperCase();
  const templateName = String(dino?.templateName ?? "").toUpperCase();

  if (templateCode === "TYRANO") return "TYRANO";
  if (templateCode === "SAURO" || templateCode === "BRACHIO") return "SAURO";
  if (templateCode === "CERATO" || templateCode === "TRICERA") return "CERATO";
  if (templateName.includes("티라노") || templateName.includes("TYRANO")) return "TYRANO";
  if (
    templateName.includes("용각") ||
    templateName.includes("브라키오") ||
    templateName.includes("BRACHIO") ||
    templateName.includes("SAURO")
  ) {
    return "SAURO";
  }
  if (
    templateName.includes("각룡") ||
    templateName.includes("트리케라") ||
    templateName.includes("TRICERA") ||
    templateName.includes("CERATO")
  ) {
    return "CERATO";
  }
  return "TYRANO";
}

function getSafeDinoStage(stage?: string | null): DinoStage {
  const safeStage = String(stage ?? "").toUpperCase();
  if (safeStage === "EGG") return "EGG";
  if (safeStage === "HATCHLING") return "HATCHLING";
  if (safeStage === "JUVENILE") return "JUVENILE";
  if (safeStage === "ADULT") return "ADULT";
  return "EGG";
}

function getStageLabel(stage: DinoStage) {
  if (stage === "EGG") return "알";
  if (stage === "HATCHLING") return "유아기";
  if (stage === "JUVENILE") return "청소년기";
  if (stage === "ADULT") return "성룡";
  return "알";
}

/* =========================
   탄소 상태 한글 표시 함수
   ========================= */

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

function getGradeStatusBg(status: string) {
  if (status === "PURIFIED") return "bg-[#E8F2EC]";
  if (status === "NORMAL") return "bg-[#FFF0EA]";
  if (status === "POLLUTED") return "bg-red-50";
  return "bg-gray-50";
}

/* =========================
   남은 시간 포맷 함수
   ========================= */

function formatRemainingTime(seconds: number) {
  if (seconds <= 0) return "곧 종료";
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (minutes > 0) {
    return `${minutes}분 ${sec}초`;
  }
  return `${sec}초`;
}

export function HomePage() {
  const navigate = useNavigate();

  // 퀴즈 모달 열림/닫힘 상태
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // 내 공룡 상태
  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);
  const [isDinoLoading, setIsDinoLoading] = useState(true);
  const [dinoErrorMessage, setDinoErrorMessage] = useState("");

  // 오늘의 미션 상태
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isMissionLoading, setIsMissionLoading] = useState(true);
  const [missionErrorMessage, setMissionErrorMessage] = useState("");

  // 탄소/전력 상태 (월드)
  const [world, setWorld] = useState<WorldCurrentResponse | null>(null);
  const [isWorldLoading, setIsWorldLoading] = useState(true);
  const [worldErrorMessage, setWorldErrorMessage] = useState("");

  // 활성 던전 상태
  const [dungeon, setDungeon] = useState<ActiveDungeonResponse>(null);
  const [isDungeonLoading, setIsDungeonLoading] = useState(true);
  const [dungeonErrorMessage, setDungeonErrorMessage] = useState("");

  useEffect(() => {
    // 1. 공룡 데이터 가져오기
    async function fetchDino() {
      try {
        setIsDinoLoading(true);
        const data = await getMyDino();
        setMyDino(data);
      } catch (err) {
        console.error(err);
        setDinoErrorMessage("공룡 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsDinoLoading(false);
      }
    }

    // 2. 오늘의 미션 가져오기
    async function fetchMissions() {
      try {
        setIsMissionLoading(true);
        const data = await getTodayMissions();
        setMissions(data);
      } catch (err) {
        console.error(err);
        setMissionErrorMessage("오늘의 미션 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsMissionLoading(false);
      }
    }

    // 3. 월드 탄소 상태 가져오기
    async function fetchWorld() {
      try {
        setIsWorldLoading(true);
        const data = await getCurrentWorld();
        setWorld(data);
      } catch (err) {
        console.error(err);
        setWorldErrorMessage("실시간 탄소/전력 상태 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsWorldLoading(false);
      }
    }

    fetchDino();
    fetchMissions();
    fetchWorld();
  }, []);

  useEffect(() => {
    // 4. 던전 정보 30초마다 갱신
    async function fetchDungeon() {
      try {
        const data = await getActiveDungeon();
        setDungeon(data);
      } catch (error) {
        console.error(error);
        setDungeonErrorMessage("던전 정보를 불러오지 못했습니다.");
      } finally {
        setIsDungeonLoading(false);
      }
    }

    fetchDungeon();
    const intervalId = setInterval(fetchDungeon, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // 미션 개수 계산
  const totalMissionCount = missions.length;
  const completedMissionCount = missions.filter((mission) => mission.completed).length;
  const remainingMissionCount = totalMissionCount - completedMissionCount;

  // 공룡 이미지 계산
  const safeDinoType = getSafeDinoType(myDino);
  const safeDinoStage = getSafeDinoStage(myDino?.stage);
  const safeDinoStageLabel = getStageLabel(safeDinoStage);
  const myDinoImage = myDino ? dinoImagesByType[safeDinoType][safeDinoStage] : null;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />
      
      <main className="mx-auto max-w-5xl p-6">
        {/* 상단 제목 영역 */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">ECOVISION</p>
            <h1 className="mt-2 text-3xl font-bold">오늘의 탄소 절감 현황</h1>
            <p className="mt-2 text-sm text-gray-600">
              미션과 퀴즈를 완료하고 나의 디노를 성장시켜보세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/leaderboard")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2.5 text-xs font-bold text-[#5F8C74] bg-white transition hover:bg-[#E8F2EC] cursor-pointer shadow-sm"
            >
              📊 랭킹 보드
            </button>
            <button
              type="button"
              onClick={() => navigate("/region-ranking")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2.5 text-xs font-bold text-[#5F8C74] bg-white transition hover:bg-[#E8F2EC] cursor-pointer shadow-sm"
            >
              🗺️ 지역 랭킹
            </button>
            <button
              type="button"
              onClick={() => navigate("/guild")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2.5 text-xs font-bold text-[#5F8C74] bg-white transition hover:bg-[#E8F2EC] cursor-pointer shadow-sm"
            >
              🛡️ 길드 관리
            </button>
            <button
              type="button"
              onClick={() => navigate("/world-dungeon")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2.5 text-xs font-bold text-[#5F8C74] bg-white transition hover:bg-[#E8F2EC] cursor-pointer shadow-sm"
            >
              🚨 비상 던전
            </button>
            <button
              type="button"
              onClick={() => navigate("/community")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2.5 text-xs font-bold text-[#5F8C74] bg-white transition hover:bg-[#E8F2EC] cursor-pointer shadow-sm"
            >
              🌿 커뮤니티
            </button>
          </div>
        </header>

        {/* 카드 그리드 영역 */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* 내 공룡 요약 카드 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm border border-[#E8F2EC]">
            <p className="text-sm font-bold text-[#5F8C74]">MY DINO</p>

            {isDinoLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                내 공룡 정보를 불러오는 중...
              </div>
            )}

            {!isDinoLoading && dinoErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {dinoErrorMessage}
                <p className="mt-1 text-xs font-normal text-gray-500">
                  공룡 선택을 아직 완료하지 않았다면 공룡 선택 화면으로 이동해주세요.
                </p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] cursor-pointer"
                  onClick={() => navigate("/onboarding/dino")}
                >
                  공룡 선택하러 가기
                </button>
              </div>
            )}

            {!isDinoLoading && myDino && myDinoImage && (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-[#E8F2EC]">
                    <img
                      src={myDinoImage}
                      alt={`${myDino.nickname} 이미지`}
                      className="h-24 object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-bold">{myDino.nickname}</h2>
                    <p className="mt-1 text-sm text-gray-600">종류: {myDino.templateName}</p>
                    <p className="mt-1 text-sm text-gray-600">성장 단계: {safeDinoStageLabel}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      EXP {myDino.exp} / {myDino.nextStageExp === null ? "MAX" : myDino.nextStageExp}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">친밀도 {myDino.affinity}%</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] cursor-pointer"
                    onClick={() => navigate("/dino-room")}
                  >
                    디노룸 가기
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-[#5F8C74] bg-white py-3 font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC] cursor-pointer"
                    onClick={() => navigate("/dino-collection")}
                  >
                    디노도감 보기
                  </button>
                </div>
              </>
            )}
          </article>

          {/* 오늘의 미션 요약 카드 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm border border-[#E8F2EC]">
            <p className="text-sm font-bold text-[#5F8C74]">TODAY MISSION</p>

            {isMissionLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                오늘의 미션 정보를 불러오는 중...
              </div>
            )}

            {!isMissionLoading && missionErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {missionErrorMessage}
              </div>
            )}

            {!isMissionLoading && !missionErrorMessage && (
              <>
                <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>전체 미션</span>
                    <span>{totalMissionCount}개</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span>완료한 미션</span>
                    <span>{completedMissionCount}개</span>
                  </div>
                  <div className="mt-1 flex justify-between font-bold text-[#E07A5F]">
                    <span>남은 미션</span>
                    <span>{remainingMissionCount}개</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] cursor-pointer"
                  onClick={() => navigate("/missions")}
                >
                  미션 보러가기
                </button>
              </>
            )}
          </article>

          {/* 탄소 / 전력 상태 카드 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm border border-[#E8F2EC]">
            <p className="text-sm font-bold text-[#5F8C74]">CARBON STATUS</p>

            {isWorldLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                탄소 상태 정보를 불러오는 중...
              </div>
            )}

            {!isWorldLoading && worldErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {worldErrorMessage}
              </div>
            )}

            {!isWorldLoading && !worldErrorMessage && world && (
              <>
                <h2 className={`mt-2 text-2xl font-bold ${getGradeStatusColor(world.gradeStatus)}`}>
                  {getGradeStatusLabel(world.gradeStatus)}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  실시간 전력 데이터를 기반으로 한 우리 동네 환경 상태입니다.
                </p>

                <div className={`mt-4 rounded-2xl p-4 text-sm ${getGradeStatusBg(world.gradeStatus)}`}>
                  <div className="flex justify-between">
                    <span className="text-gray-600">탄소집약도</span>
                    <span className="font-bold">{world.carbonIntensity} gCO₂/kWh</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-gray-600">보상 가중치</span>
                    <span className="font-bold text-[#E07A5F]">×{world.carbonWeight}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-gray-600">전력 예비율</span>
                    <span className="font-bold">{world.reserveRate.toFixed(1)}%</span>
                  </div>
                </div>

                {world.isFallback && (
                  <p className="mt-2 text-xs text-gray-500">⚠️ 직전 데이터를 표시하고 있어요.</p>
                )}
              </>
            )}
          </article>

          {/* 던전 카드 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm border border-[#E8F2EC]">
            <p className="text-sm font-bold text-[#5F8C74]">DUNGEON</p>

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
                <h2 className="mt-2 text-2xl font-bold text-[#E07A5F]">🔥 던전 발령 중!</h2>
                <p className="mt-2 text-sm text-gray-600">
                  전력 피크 상황입니다. 던전 미션을 완료하면 보상이 2배예요!
                </p>

                <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">남은 시간</span>
                    <span className="font-bold text-[#E07A5F]">
                      {formatRemainingTime(dungeon.remainingSeconds)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-gray-600">보상 배율</span>
                    <span className="font-bold text-[#E07A5F]">×{dungeon.dungeonMultiplier}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-gray-600">던전 미션</span>
                    <span className="font-bold">{(dungeon.missions || []).length}개</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#E07A5F] py-3 font-bold text-white transition hover:bg-[#c8654d] cursor-pointer"
                  onClick={() => navigate("/world-dungeon")}
                >
                  던전 입장하기
                </button>
              </>
            )}

            {/* 활성 던전이 없을 때 */}
            {!isDungeonLoading && !dungeonErrorMessage && !dungeon && (
              <>
                <h2 className="mt-2 text-2xl font-bold text-[#5F8C74]">😌 평온한 상태</h2>
                <p className="mt-2 text-sm text-gray-600">
                  현재 전력 상황이 안정적이에요. 평소처럼 미션을 진행해주세요.
                </p>
                <div className="mt-4 rounded-2xl bg-[#E8F2EC] p-4 text-sm text-gray-600">
                  전력 예비율이 10% 미만으로 떨어지면 던전이 자동으로 발령됩니다. 던전 발령 시 보상이 2배가 돼요!
                </div>
              </>
            )}
          </article>

          {/* 에코 퀴즈 카드 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm border border-[#E8F2EC] md:col-span-2">
            <p className="text-sm font-bold text-[#5F8C74]">ECO QUIZ</p>
            <h2 className="mt-2 text-2xl font-bold">오늘의 에코 퀴즈</h2>
            <p className="mt-2 text-sm text-gray-600">
              하루 한 번 퀴즈를 풀고 보상을 받을 수 있어요.
            </p>

            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
              <p className="font-bold text-[#5F8C74]">퀴즈 API가 연결되어 있습니다.</p>
              <p className="mt-1 text-xs text-gray-500">
                버튼을 누르면 오늘의 퀴즈를 불러오고 정답을 제출할 수 있어요.
              </p>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[#E07A5F] py-3 font-bold text-white transition hover:bg-[#c8654d] cursor-pointer"
              onClick={() => setIsQuizOpen(true)}
            >
              퀴즈 풀기
            </button>
          </article>
        </section>
      </main>

      {/* 퀴즈 모달 */}
      {isQuizOpen && <EcoQuizModal onClose={() => setIsQuizOpen(false)} />}
    </div>
  );
}
