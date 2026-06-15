// src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../api/authApi";
import { getMyDino, type MyDinoResponse } from "../api/dinoApi";
import { getTodayMissions } from "../api/missionApi";

import { EcoQuizModal } from "../components/quiz/EcoQuizModal";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

import type { Mission } from "../types/mission";

/*
  HomePage에서 하는 일

  1. 내 공룡 정보 조회
     GET /api/me/dino

  2. 오늘의 미션 목록 조회
     GET /api/missions/today

  3. 현재 탄소/전력 상태 조회
     GET /api/world/current

  4. 현재 던전 상태 조회
     GET /api/dungeons/active

  5. 퀴즈 모달 열기
     EcoQuizModal 안에서 GET /api/quiz/today 호출
*/

/* =========================
   타입 정의
   ========================= */

type WorldStatus = {
  carbonIntensity: number;
  gradeStatus: "PURIFIED" | "NORMAL" | "POLLUTED";
  carbonWeight: number;
  reserveRate: number;
  dungeonActive: boolean;
  measuredAt: string;
  isFallback: boolean;
  powerMix?: {
    source: string;
    ratio: number;
  }[];
};

type ActiveDungeonMission = {
  assignmentId: number;
  title: string;
  estimatedCo2Kg: number;
  baseReward: number;
};

type ActiveDungeon = {
  dungeonId: number;
  status: "ACTIVE" | "ENDED";
  reserveRate: number;
  dungeonMultiplier: number;
  startedAt: string;
  endsAt: string;

  // 백엔드 응답에 없을 수도 있어서 optional로 둡니다.
  remainingSeconds?: number;
  remainingTimeSeconds?: number;

  // 백엔드 응답에 missions가 없을 수도 있어서 optional로 둡니다.
  missions?: ActiveDungeonMission[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  } | null;
};

/* =========================
   공통 API 호출 함수
   ========================= */

const API_BASE_URL = "http://localhost:8080";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

async function authFetch<T>(url: string): Promise<T> {
  const accessToken = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || body.success === false) {
    throw new Error(body.error?.message || "API 요청에 실패했습니다.");
  }

  return body.data;
}

async function getWorldCurrent() {
  return authFetch<WorldStatus>("/api/world/current");
}

async function getActiveDungeon() {
  return authFetch<ActiveDungeon | null>("/api/dungeons/active");
}

/* =========================
   공룡 안전 처리 함수
   ========================= */

function getSafeDinoType(dino?: MyDinoResponse | null): DinoType {
  const templateCode = String(
    (dino as MyDinoResponse & { templateCode?: string })?.templateCode ?? "",
  );

  const templateName = String(dino?.templateName ?? "");

  if (templateCode === "TYRANO") {
    return "TYRANO";
  }

  if (templateCode === "SAURO" || templateCode === "BRACHIO") {
    return "SAURO";
  }

  if (templateCode === "CERATO" || templateCode === "TRICERA") {
    return "CERATO";
  }

  if (templateName.includes("티라노") || templateName.includes("TYRANO")) {
    return "TYRANO";
  }

  if (
    templateName.includes("브라키오") ||
    templateName.includes("BRACHIO") ||
    templateName.includes("용각")
  ) {
    return "SAURO";
  }

  if (
    templateName.includes("트리케라") ||
    templateName.includes("TRICERA") ||
    templateName.includes("각룡")
  ) {
    return "CERATO";
  }

  return "TYRANO";
}

function getSafeDinoStage(stage?: string | null): DinoStage {
  if (stage === "EGG") {
    return "EGG";
  }

  if (stage === "HATCHLING") {
    return "HATCHLING";
  }

  if (stage === "JUVENILE") {
    return "JUVENILE";
  }

  if (stage === "ADULT") {
    return "ADULT";
  }

  return "EGG";
}

/* =========================
   화면 표시용 함수
   ========================= */

function getGradeLabel(gradeStatus?: WorldStatus["gradeStatus"]) {
  if (gradeStatus === "PURIFIED") {
    return "정화 상태";
  }

  if (gradeStatus === "NORMAL") {
    return "보통 상태";
  }

  if (gradeStatus === "POLLUTED") {
    return "오염 상태";
  }

  return "확인 중";
}

function getGradeEmoji(gradeStatus?: WorldStatus["gradeStatus"]) {
  if (gradeStatus === "PURIFIED") {
    return "🌍";
  }

  if (gradeStatus === "NORMAL") {
    return "🌤️";
  }

  if (gradeStatus === "POLLUTED") {
    return "🔥";
  }

  return "🌱";
}

function getDungeonRemainingSeconds(dungeon: ActiveDungeon | null) {
  if (!dungeon) {
    return 0;
  }

  return dungeon.remainingSeconds ?? dungeon.remainingTimeSeconds ?? 0;
}

export function HomePage() {
  const navigate = useNavigate();

  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [worldStatus, setWorldStatus] = useState<WorldStatus | null>(null);
  const [activeDungeon, setActiveDungeon] = useState<ActiveDungeon | null>(
    null,
  );

  const [isDinoLoading, setIsDinoLoading] = useState(true);
  const [isMissionLoading, setIsMissionLoading] = useState(true);
  const [isWorldLoading, setIsWorldLoading] = useState(true);
  const [isDungeonLoading, setIsDungeonLoading] = useState(true);

  const [dinoErrorMessage, setDinoErrorMessage] = useState("");
  const [missionErrorMessage, setMissionErrorMessage] = useState("");
  const [worldErrorMessage, setWorldErrorMessage] = useState("");
  const [dungeonErrorMessage, setDungeonErrorMessage] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsDinoLoading(true);
        setDinoErrorMessage("");

        const dinoData = await getMyDino();

        setMyDino(dinoData);
      } catch (error) {
        console.error(error);
        setDinoErrorMessage("내 공룡 정보를 불러오지 못했습니다.");
      } finally {
        setIsDinoLoading(false);
      }

      try {
        setIsMissionLoading(true);
        setMissionErrorMessage("");

        const missionData = await getTodayMissions();

        setMissions(missionData);
      } catch (error) {
        console.error(error);
        setMissionErrorMessage("오늘의 미션 정보를 불러오지 못했습니다.");
      } finally {
        setIsMissionLoading(false);
      }

      try {
        setIsWorldLoading(true);
        setWorldErrorMessage("");

        const worldData = await getWorldCurrent();

        setWorldStatus(worldData);
      } catch (error) {
        console.error(error);
        setWorldErrorMessage("현재 탄소/전력 상태를 불러오지 못했습니다.");
      } finally {
        setIsWorldLoading(false);
      }

      try {
        setIsDungeonLoading(true);
        setDungeonErrorMessage("");

        const dungeonData = await getActiveDungeon();

        setActiveDungeon(dungeonData);
      } catch (error) {
        console.error(error);
        setDungeonErrorMessage("던전 상태를 불러오지 못했습니다.");
      } finally {
        setIsDungeonLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("myDino");

      navigate("/login");
    }
  };

  const dinoType = getSafeDinoType(myDino);
  const dinoStage = getSafeDinoStage(String(myDino?.stage ?? ""));
  const myDinoImage = myDino ? dinoImagesByType[dinoType][dinoStage] : null;

  const totalMissionCount = missions.length;
  const completedMissionCount = missions.filter(
    (mission) => mission.completed,
  ).length;
  const remainingMissionCount = totalMissionCount - completedMissionCount;

  const missionProgressText = `${completedMissionCount} / ${totalMissionCount}`;

  const reserveRate = worldStatus?.reserveRate ?? 0;
  const reserveBarWidth = Math.min(reserveRate * 5, 100);

  const dungeonMissionCount = activeDungeon?.missions?.length ?? 0;
  const dungeonRemainingSeconds = getDungeonRemainingSeconds(activeDungeon);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-4xl">
        {/* 상단 제목 영역 */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">ECOVISION</p>

            <h1 className="mt-2 text-3xl font-bold">오늘의 탄소 절감 현황</h1>

            <p className="mt-2 text-sm text-gray-600">
              전력 상황을 확인하고, 미션과 퀴즈로 공룡을 성장시켜보세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-[#5F8C74] px-4 py-2 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            로그아웃
          </button>
        </header>

        {/* 던전 경고 영역 */}
        {activeDungeon && (
          <section className="mb-4 rounded-3xl bg-[#E07A5F] p-5 text-white shadow-sm">
            <p className="text-sm font-bold">DUNGEON ALERT</p>

            <h2 className="mt-1 text-xl font-bold">
              전력 예비율이 낮아 던전 상황이 발생했어요
            </h2>

            <p className="mt-2 text-sm">
              지금 미션을 완료하면 던전 배율이 반영된 보상을 받을 수 있어요.
            </p>
          </section>
        )}

        {/* 카드 그리드 영역 */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* 탄소 / 전력 상태 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">CARBON STATUS</p>

            {isWorldLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                탄소/전력 상태를 불러오는 중...
              </div>
            )}

            {!isWorldLoading && worldErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {worldErrorMessage}
              </div>
            )}

            {!isWorldLoading && worldStatus && (
              <>
                <h2 className="mt-2 text-2xl font-bold">
                  {getGradeEmoji(worldStatus.gradeStatus)} 탄소 상태:{" "}
                  {getGradeLabel(worldStatus.gradeStatus)}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  현재 전력 예비율은 {worldStatus.reserveRate}%입니다.
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  탄소집약도: {worldStatus.carbonIntensity}
                </p>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E8F2EC]">
                  <div
                    className="h-full rounded-full bg-[#E07A5F]"
                    style={{ width: `${reserveBarWidth}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  전력 예비율이 낮을수록 절전 미션의 중요도가 높아집니다.
                </p>
              </>
            )}
          </article>

          {/* 내 공룡 요약 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
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
                  공룡 선택을 아직 완료하지 않았다면 공룡 선택 화면으로
                  이동해주세요.
                </p>
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

                    <p className="mt-1 text-sm text-gray-600">
                      종류: {myDino.templateName}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      성장 단계: {myDino.stage}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      EXP {myDino.exp} / {myDino.nextStageExp}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      친밀도 {myDino.affinity}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                    onClick={() => navigate("/dino-room")}
                  >
                    디노 룸 가기
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl border border-[#5F8C74] bg-white py-3 font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
                    onClick={() => navigate("/dino-collection")}
                  >
                    내 디노 도감 보기
                  </button>
                </div>
              </>
            )}

            {!isDinoLoading && !myDino && (
              <button
                type="button"
                className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                onClick={() => navigate("/onboarding/dino")}
              >
                공룡 선택하러 가기
              </button>
            )}
          </article>

          {/* 오늘의 미션 요약 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">TODAY MISSION</p>

            <h2 className="mt-2 text-2xl font-bold">
              오늘의 미션 {missionProgressText}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              오늘 배정된 탄소 절감 미션을 완료하고 포인트와 EXP를 얻어보세요.
            </p>

            {isMissionLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                미션 정보를 불러오는 중...
              </div>
            )}

            {!isMissionLoading && missionErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {missionErrorMessage}
              </div>
            )}

            {!isMissionLoading && !missionErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
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
            )}

            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
              onClick={() => navigate("/missions")}
            >
              미션 보러가기
            </button>
          </article>

          {/* 던전 상태 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">DUNGEON</p>

            <h2 className="mt-2 text-2xl font-bold">현재 던전 상태</h2>

            {isDungeonLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                던전 상태를 불러오는 중...
              </div>
            )}

            {!isDungeonLoading && dungeonErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {dungeonErrorMessage}
              </div>
            )}

            {!isDungeonLoading && !dungeonErrorMessage && !activeDungeon && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                현재 활성화된 던전이 없습니다.
              </div>
            )}

            {!isDungeonLoading && !dungeonErrorMessage && activeDungeon && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm">
                <div className="flex justify-between">
                  <span>예비율</span>
                  <span>{activeDungeon.reserveRate}%</span>
                </div>

                <div className="mt-1 flex justify-between">
                  <span>던전 배율</span>
                  <span>{activeDungeon.dungeonMultiplier}배</span>
                </div>

                <div className="mt-1 flex justify-between">
                  <span>남은 시간</span>
                  <span>{dungeonRemainingSeconds}초</span>
                </div>

                <div className="mt-1 flex justify-between">
                  <span>던전 미션</span>
                  <span>{dungeonMissionCount}개</span>
                </div>
              </div>
            )}
          </article>

          {/* 에코 퀴즈 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm md:col-span-2">
            <p className="text-sm font-bold text-[#5F8C74]">ECO QUIZ</p>

            <h2 className="mt-2 text-2xl font-bold">오늘의 에코 퀴즈</h2>

            <p className="mt-2 text-sm text-gray-600">
              하루 한 번 퀴즈를 풀고 30 AP 보상을 받을 수 있어요.
            </p>

            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
              <p className="font-bold text-[#5F8C74]">
                오늘의 퀴즈를 풀고 클린에너지를 받아보세요.
              </p>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[#E07A5F] py-3 font-bold text-white transition hover:bg-[#c8654d]"
              onClick={() => setIsQuizOpen(true)}
            >
              퀴즈 풀기
            </button>
          </article>
        </section>
      </section>

      {/* 퀴즈 모달 */}
      {isQuizOpen && <EcoQuizModal onClose={() => setIsQuizOpen(false)} />}
    </main>
  );
}
