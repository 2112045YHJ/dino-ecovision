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
  이 HomePage에서 하는 일

  1. 내 공룡 정보 가져오기
     GET /api/me/dino

  2. 오늘의 미션 목록 가져오기
     GET /api/missions/today

  3. 현재 세계 상태 가져오기
     GET /api/world/current

  4. 현재 활성 던전 가져오기
     GET /api/dungeons/active

  5. 가져온 데이터를 홈 화면에 표시하기
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

type ActiveDungeon = {
  dungeonId: number;
  status: "ACTIVE" | "ENDED";
  reserveRate: number;
  dungeonMultiplier: number;
  startedAt: string;
  endsAt: string;
  remainingSeconds: number;
  missions: {
    assignmentId: number;
    title: string;
    estimatedCo2Kg: number;
    baseReward: number;
  }[];
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

/*
  백엔드에서 내려주는 templateCode/templateName을
  프론트가 아는 공룡 타입으로 바꿔주는 함수입니다.

  프론트가 아는 타입:
  - TYRANO
  - SAURO
  - CERATO
*/

function getSafeDinoType(dino?: MyDinoResponse | null): DinoType {
  /*
    templateCode를 string으로 강제로 넓혀서 받습니다.

    왜 이렇게 하냐면?
    프론트가 아는 DinoType은 TYRANO / SAURO / CERATO뿐인데,
    백엔드나 DB에서는 BRACHIO / TRICERA 같은 다른 이름이 올 수도 있기 때문입니다.

    그래서 TypeScript에게:
    "이 값은 꼭 DinoType만 오는 게 아니라 그냥 문자열일 수도 있어"
    라고 알려주는 것입니다.
  */
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

/*
  백엔드 stage 값이 혹시 이상하게 오더라도
  화면이 터지지 않게 안전하게 처리합니다.
*/
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
   세계 상태 표시용 함수
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
    return "🌋";
  }

  return "🌱";
}

function getReserveStatusText(reserveRate?: number) {
  if (reserveRate === undefined) {
    return "확인 중";
  }

  if (reserveRate < 10) {
    return "위험";
  }

  if (reserveRate < 15) {
    return "주의";
  }

  return "안정";
}

/* =========================
   HomePage 컴포넌트
   ========================= */

export function HomePage() {
  const navigate = useNavigate();

  /*
    퀴즈 모달 열림/닫힘 상태입니다.
    지금은 기존 mockTodayQuiz를 그대로 사용합니다.
    퀴즈 API 연결은 다음 단계에서 따로 붙이면 됩니다.
  */
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  /*
    내 공룡 상태
  */
  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);
  const [isDinoLoading, setIsDinoLoading] = useState(true);
  const [dinoErrorMessage, setDinoErrorMessage] = useState("");

  /*
    오늘의 미션 상태
  */
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isMissionLoading, setIsMissionLoading] = useState(true);
  const [missionErrorMessage, setMissionErrorMessage] = useState("");

  /*
    현재 세계 상태
    GET /api/world/current
  */
  const [worldStatus, setWorldStatus] = useState<WorldStatus | null>(null);
  const [isWorldLoading, setIsWorldLoading] = useState(true);
  const [worldErrorMessage, setWorldErrorMessage] = useState("");

  /*
    현재 던전 상태
    GET /api/dungeons/active
  */
  const [activeDungeon, setActiveDungeon] = useState<ActiveDungeon | null>(
    null,
  );
  const [isDungeonLoading, setIsDungeonLoading] = useState(true);
  const [dungeonErrorMessage, setDungeonErrorMessage] = useState("");

  /*
    홈 화면이 처음 열릴 때 내 공룡 정보를 가져옵니다.
  */
  useEffect(() => {
    const fetchMyDino = async () => {
      try {
        setIsDinoLoading(true);
        setDinoErrorMessage("");

        const data = await getMyDino();

        setMyDino(data);
      } catch (error) {
        console.error(error);
        setDinoErrorMessage("내 공룡 정보를 불러오지 못했습니다.");
      } finally {
        setIsDinoLoading(false);
      }
    };

    fetchMyDino();
  }, []);

  /*
    홈 화면이 처음 열릴 때 오늘의 미션 목록을 가져옵니다.
  */
  useEffect(() => {
    const fetchTodayMissions = async () => {
      try {
        setIsMissionLoading(true);
        setMissionErrorMessage("");

        const data = await getTodayMissions();

        setMissions(data);
      } catch (error) {
        console.error(error);
        setMissionErrorMessage("오늘의 미션 정보를 불러오지 못했습니다.");
      } finally {
        setIsMissionLoading(false);
      }
    };

    fetchTodayMissions();
  }, []);

  /*
    홈 화면이 처음 열릴 때 현재 세계 상태를 가져옵니다.
  */
  useEffect(() => {
    const fetchWorldStatus = async () => {
      try {
        setIsWorldLoading(true);
        setWorldErrorMessage("");

        const data = await getWorldCurrent();

        setWorldStatus(data);
      } catch (error) {
        console.error(error);
        setWorldErrorMessage("현재 탄소/전력 상태를 불러오지 못했습니다.");
      } finally {
        setIsWorldLoading(false);
      }
    };

    fetchWorldStatus();
  }, []);

  /*
    홈 화면이 처음 열릴 때 활성 던전 정보를 가져옵니다.
  */
  useEffect(() => {
    const fetchActiveDungeon = async () => {
      try {
        setIsDungeonLoading(true);
        setDungeonErrorMessage("");

        const data = await getActiveDungeon();

        setActiveDungeon(data);
      } catch (error) {
        console.error(error);
        setDungeonErrorMessage("던전 상태를 불러오지 못했습니다.");
      } finally {
        setIsDungeonLoading(false);
      }
    };

    fetchActiveDungeon();
  }, []);

  /*
    로그아웃 버튼을 눌렀을 때 실행됩니다.
  */
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

  /*
    미션 개수 계산
  */
  const totalMissionCount = missions.length;

  const completedMissionCount = missions.filter(
    (mission) => mission.completed,
  ).length;

  const remainingMissionCount = totalMissionCount - completedMissionCount;

  const missionProgressText = `${completedMissionCount} / ${totalMissionCount}`;

  /*
    전력 예비율 바 계산
    예비율이 15.4%면 화면에서는 너무 짧게 보일 수 있으니
    보기 좋게 5배 해서 최대 100%까지만 보여줍니다.
  */
  const reserveRate = worldStatus?.reserveRate ?? 0;
  const reserveBarWidth = Math.min(reserveRate * 5, 100);

  /*
    던전 활성 여부
    activeDungeon이 있거나 worldStatus.dungeonActive가 true면 던전 상태로 봅니다.
  */
  const isDungeonActive = Boolean(activeDungeon || worldStatus?.dungeonActive);

  /*
    공룡 이미지 계산
  */
  const safeDinoType = getSafeDinoType(myDino);
  const safeDinoStage = getSafeDinoStage(myDino?.stage);

  const myDinoImage = myDino
    ? dinoImagesByType[safeDinoType][safeDinoStage]
    : null;

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
        {isDungeonActive && (
          <section className="mb-4 rounded-3xl bg-[#E07A5F] p-5 text-white shadow-sm">
            <p className="text-sm font-bold">DUNGEON ALERT</p>

            <h2 className="mt-1 text-xl font-bold">
              전력 피크 던전이 발령 중입니다
            </h2>

            <p className="mt-2 text-sm">
              지금 미션을 완료하면 던전 보상 배율이 적용될 수 있어요.
            </p>

            {activeDungeon && (
              <div className="mt-4 rounded-2xl bg-white/20 p-3 text-sm">
                <p>던전 배율: x{activeDungeon.dungeonMultiplier}</p>
                <p>남은 시간: {activeDungeon.remainingSeconds}초</p>
              </div>
            )}
          </section>
        )}

        {/* 카드 그리드 영역 */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* 탄소 / 전력 상태 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">CARBON STATUS</p>

            {isWorldLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                현재 탄소/전력 상태를 불러오는 중...
              </div>
            )}

            {!isWorldLoading && worldErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {worldErrorMessage}
              </div>
            )}

            {!isWorldLoading && worldStatus && (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-[#5F8C74] bg-[#E8F2EC]">
                    <span className="text-4xl">
                      {getGradeEmoji(worldStatus.gradeStatus)}
                    </span>
                    <span className="mt-1 text-xs font-bold text-[#5F8C74]">
                      {worldStatus.gradeStatus}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      탄소 상태: {getGradeLabel(worldStatus.gradeStatus)}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                      탄소집약도: {worldStatus.carbonIntensity} gCO₂/kWh
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      보상 가중치: x{worldStatus.carbonWeight}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-sm font-bold">
                    <span>전력 공급 예비율</span>
                    <span
                      className={
                        worldStatus.reserveRate < 10
                          ? "text-[#E07A5F]"
                          : "text-[#5F8C74]"
                      }
                    >
                      {worldStatus.reserveRate}% (
                      {getReserveStatusText(worldStatus.reserveRate)})
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#E8F2EC]">
                    <div
                      className={
                        worldStatus.reserveRate < 10
                          ? "h-full rounded-full bg-[#E07A5F]"
                          : "h-full rounded-full bg-[#5F8C74]"
                      }
                      style={{ width: `${reserveBarWidth}%` }}
                    />
                  </div>
                </div>

                {worldStatus.isFallback && (
                  <p className="mt-3 text-xs text-[#E07A5F]">
                    현재 값은 최신 수집 실패로 인해 직전 정상 데이터를 표시하고
                    있습니다.
                  </p>
                )}
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
                      EXP {myDino.exp} /{" "}
                      {myDino.nextStageExp === null
                        ? "MAX"
                        : myDino.nextStageExp}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      친밀도 {myDino.affinity}%
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                  onClick={() => navigate("/dino-room")}
                >
                  디노 룸 가기
                </button>
              </>
            )}

            {!isDinoLoading && !myDino && (
              <button
                type="button"
                className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                onClick={() => navigate("/dino-selection")}
              >
                공룡 선택하러 가기
              </button>
            )}
          </article>

          {/* 오늘의 미션 요약 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
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
                <h2 className="mt-2 text-2xl font-bold">
                  오늘의 미션 {missionProgressText}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  오늘 배정된 탄소 절감 미션을 완료하고 포인트와 EXP를
                  얻어보세요.
                </p>

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

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                  onClick={() => navigate("/missions")}
                >
                  미션 보러가기
                </button>
              </>
            )}
          </article>

          {/* 던전 미션 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">DUNGEON</p>

            {isDungeonLoading && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                던전 상태를 확인하는 중...
              </div>
            )}

            {!isDungeonLoading && dungeonErrorMessage && (
              <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
                {dungeonErrorMessage}
              </div>
            )}

            {!isDungeonLoading && !dungeonErrorMessage && !activeDungeon && (
              <>
                <h2 className="mt-2 text-2xl font-bold">현재 던전 없음</h2>

                <p className="mt-2 text-sm text-gray-600">
                  현재는 전력 피크 던전이 발령되지 않았습니다.
                </p>

                <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
                  전력 예비율이 낮아지면 던전 미션이 활성화됩니다.
                </div>
              </>
            )}

            {!isDungeonLoading && activeDungeon && (
              <>
                <h2 className="mt-2 text-2xl font-bold text-[#E07A5F]">
                  던전 발령 중
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  예비율 {activeDungeon.reserveRate}% 기준으로 던전이
                  발령되었습니다.
                </p>

                <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm">
                  <div className="flex justify-between">
                    <span>보상 배율</span>
                    <span>x{activeDungeon.dungeonMultiplier}</span>
                  </div>

                  <div className="mt-1 flex justify-between">
                    <span>남은 시간</span>
                    <span>{activeDungeon.remainingSeconds}초</span>
                  </div>

                  <div className="mt-1 flex justify-between">
                    <span>던전 미션</span>
                    <span>{activeDungeon.missions?.length ?? 0}개</span>
                  </div>
                </div>
              </>
            )}
          </article>

          {/* 에코 퀴즈 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm md:col-span-2">
            <p className="text-sm font-bold text-[#5F8C74]">ECO QUIZ</p>

            <h2 className="mt-2 text-2xl font-bold">오늘의 에코 퀴즈</h2>

            <p className="mt-2 text-sm text-gray-600">
              하루 한 번 퀴즈를 풀고 30P 보상을 받을 수 있어요.
            </p>

            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
              <p className="font-bold text-[#5F8C74]">
                퀴즈 모달 UI는 준비되어 있습니다.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                다음 단계에서 GET /api/quiz/today 와 POST /api/quiz/{"{quizId}"}
                /submit 을 연결하면 됩니다.
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
