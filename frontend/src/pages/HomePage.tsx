import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { EcoQuizModal } from "../components/quiz/EcoQuizModal";
import { logout } from "../api/authApi";
import { getMyDino, type MyDinoResponse } from "../api/dinoApi";
import { getTodayMissions } from "../api/missionApi";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

import type { Mission } from "../types/mission";

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
  remainingSeconds?: number;
  remainingTimeSeconds?: number;
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
    throw new Error(body.error?.message || "API요청 실패");
  }
  return body.data;
}

async function getWorldCurrent() {
  return authFetch<WorldStatus>("/api/world/current");
}

async function getActiveDungeon() {
  return authFetch<ActiveDungeon | null>("/api/dungeons/active");
}

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
  if (stage === "EGG") return "EGG";
  if (stage === "HATCHLING") return "HATCHLING";
  if (stage === "JUVENILE") return "JUVENILE";
  if (stage === "ADULT") return "ADULT";
  return "EGG";
}


function getGradeEmoji(gradeStatus?: WorldStatus["gradeStatus"]) {
  if (gradeStatus === "PURIFIED") return "🌍";
  if (gradeStatus === "NORMAL") return "🌤️";
  if (gradeStatus === "POLLUTED") return "🔥";
  return "🌱";
}


export function HomePage() {
  const navigate = useNavigate();
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [worldStatus, setWorldStatus] = useState<WorldStatus | null>(null);
  const [activeDungeon, setActiveDungeon] = useState<ActiveDungeon | null>(null);

  const [isDinoLoading, setIsDinoLoading] = useState(true);
  const [isMissionLoading, setIsMissionLoading] = useState(true);
  const [isWorldLoading, setIsWorldLoading] = useState(true);

  const [dinoErrorMessage, setDinoErrorMessage] = useState("");
  const [missionErrorMessage, setMissionErrorMessage] = useState("");
  const [worldErrorMessage, setWorldErrorMessage] = useState("");

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
        const dungeonData = await getActiveDungeon();
        setActiveDungeon(dungeonData);
      } catch (error) {
        console.error(error);
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

  const missionProgressText = `${completedMissionCount} / ${totalMissionCount}`;

  const reserveRate = worldStatus?.reserveRate ?? 0;
  const reserveBarWidth = Math.min(reserveRate * 5, 100);


  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      {/* 상단 글로벌 내비게이션 바 */}
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        {/* 상단 제목 및 로그아웃 버튼 영역 */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">ECOVISION</p>
            <h1 className="mt-1 text-3xl font-bold text-[#2C3531]">오늘의 탄소 절감 현황</h1>
            <p className="mt-1 text-sm text-gray-600">
              전력 상황을 확인하고, 미션과 퀴즈로 공룡을 성장시켜보세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-[#5F8C74] px-4 py-2 text-xs font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC] cursor-pointer shadow-xs self-start"
          >
            로그아웃
          </button>
        </header>

        {/* 던전 경고 영역 */}
        {activeDungeon && (
          <section className="mb-6 rounded-3xl bg-[#E07A5F] p-5 text-white shadow-sm animate-pulse">
            <p className="text-xs font-bold tracking-wider">DUNGEON ALERT</p>
            <h2 className="mt-1 text-lg font-bold">
              전력 예비율이 낮아 던전 상황이 발생했어요!
            </h2>
            <p className="mt-2 text-sm opacity-90">
              지금 미션을 완료하면 던전 배율({activeDungeon.dungeonMultiplier}배)이 반영된 보상을 받을 수 있어요.
            </p>
          </section>
        )}

        {/* 메인 2열 레이아웃 (좌: 탄소/전력망, 우: 디노/미션) */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* 왼쪽 열: 탄소 시계 및 전력망 위젯 */}
          <div className="flex flex-col gap-6">
            {/* 지구 상태 탄소 시계 */}
            <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col items-center">
              <p className="self-start text-xs font-bold text-[#5F8C74] tracking-wider mb-4">CARBON STATUS</p>
              <h2 className="text-lg font-bold text-gray-800 mb-6">지구 상태 탄소 시계</h2>
              
              {isWorldLoading && <div className="text-sm text-gray-500 animate-pulse py-6">🌍 탄소/전력 상태를 불러오는 중...</div>}
              {!isWorldLoading && worldErrorMessage && (
                <div className="rounded-2xl bg-[#FFF1EC] p-4 text-xs font-bold text-[#E07A5F] text-center border border-[#E07A5F]/20">
                  {worldErrorMessage}
                </div>
              )}
              
              {!isWorldLoading && worldStatus && (
                <>
                  {/* 지구 모양 원형 프로그래스 바 */}
                  <div className="relative w-36 h-36 rounded-full border-8 border-[#5F8C74] bg-[#E8F2EC] flex flex-col justify-center items-center shadow-inner">
                    <span className="text-5xl animate-bounce">{getGradeEmoji(worldStatus.gradeStatus)}</span>
                    <span className="text-[10px] font-bold text-[#5F8C74] mt-2 tracking-widest bg-white px-2 py-0.5 rounded-full border border-[#5F8C74]/20 shadow-sm">
                      {worldStatus.gradeStatus}
                    </span>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm font-bold text-gray-700">
                      현재 탄소 집약도: <span className="text-[#5F8C74]">{worldStatus.carbonIntensity} gCO₂/kWh</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      🌿 탄소 감축 가중치 <span className="font-bold text-[#E07A5F]">x{worldStatus.carbonWeight}</span> 적용 중
                    </p>
                  </div>
                </>
              )}
            </article>

            {/* 실시간 전력 공급 예비율 */}
            <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col gap-3">
              <p className="text-xs font-bold text-[#5F8C74] tracking-wider">POWER GRID STATUS</p>
              
              {isWorldLoading && <div className="text-sm text-gray-500 animate-pulse py-2">전력 상황을 불러오는 중...</div>}
              {!isWorldLoading && worldStatus && (
                <>
                  <div className="flex justify-between items-end">
                    <h3 className="text-sm font-bold text-gray-800">실시간 전력 공급 예비율</h3>
                    <span className="text-sm font-bold text-[#5F8C74]">
                      {worldStatus.reserveRate}% ({worldStatus.reserveRate >= 10 ? "안정" : "경고"})
                    </span>
                  </div>

                  {/* 게이지 바 */}
                  <div className="h-4 w-full bg-[#E8F2EC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5F8C74] rounded-full transition-all duration-500"
                      style={{ width: `${reserveBarWidth}%` }}
                    />
                  </div>
                </>
              )}

              <p className="text-xs text-gray-500 leading-relaxed">
                전력 예비율이 10% 이하로 감소 시 비상 <span className="font-bold text-[#E07A5F]">‘절전 던전’</span>이 활성화되어 더 높은 포인트 획득 기회가 제공됩니다.
              </p>
            </article>

            {/* 에코 퀴즈 카드 */}
            <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-[#5F8C74] tracking-wider mb-2">ECO QUIZ</p>
                <h2 className="text-lg font-bold text-gray-800">오늘의 에코 퀴즈</h2>
                <p className="mt-2 text-sm text-gray-600">
                  하루 한 번 퀴즈를 풀고 30P 보상을 받을 수 있어요.
                </p>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-[#E07A5F] py-3 text-sm font-bold text-white transition hover:bg-[#c8654d] cursor-pointer shadow-sm"
                onClick={() => setIsQuizOpen(true)}
              >
                퀴즈 풀기
              </button>
            </article>
          </div>

          {/* 오른쪽 열: 내 디노 및 미션 요약 */}
          <div className="flex flex-col gap-6">
            {/* 내 공룡 요약 카드 */}
            <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <p className="text-xs font-bold text-[#5F8C74] tracking-wider mb-4">MY DINO</p>
                
                {isDinoLoading && (
                  <div className="rounded-2xl bg-[#FAF9F5] p-4 text-xs font-bold text-gray-500 animate-pulse text-center">
                    🦕 내 공룡 정보를 불러오는 중...
                  </div>
                )}

                {!isDinoLoading && dinoErrorMessage && (
                  <div className="rounded-2xl bg-[#FFF1EC] p-4 text-xs font-bold text-[#E07A5F] text-center border border-[#E07A5F]/20">
                    <p>{dinoErrorMessage}</p>
                    <p className="mt-1 text-[10px] font-normal text-gray-500">
                      공룡 선택을 완료하지 않았다면 아래 버튼으로 가 분양받아주세요.
                    </p>
                  </div>
                )}

                {!isDinoLoading && myDino && myDinoImage && (
                  <div className="flex items-center gap-5">
                    {/* 디노 이미지 랩 */}
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-[#E8F2EC] border border-[#5F8C74]/10 shadow-sm">
                      <img
                        src={myDinoImage}
                        alt={`${myDino.nickname} 이미지`}
                        className="h-24 object-contain animate-wiggle"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800 truncate">{myDino.nickname}</h2>
                        <span className="text-[10px] font-bold text-[#5F8C74] bg-[#E8F2EC] px-2 py-0.5 rounded-full uppercase border border-[#5F8C74]/20">
                          {myDino.stage}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        공룡 타입: <span className="font-bold text-gray-700">{myDino.templateName}</span>
                      </p>
                      
                      {/* 경험치 바 */}
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>EXP {myDino.exp} / {myDino.nextStageExp}</span>
                          <span>{Math.round((myDino.exp / myDino.nextStageExp) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#5F8C74] rounded-full"
                            style={{ width: `${Math.min((myDino.exp / myDino.nextStageExp) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        친밀도: <span className="font-bold text-gray-700">{myDino.affinity} / 100 ♡</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isDinoLoading && myDino && (
                <button
                  type="button"
                  className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] cursor-pointer shadow-sm"
                  onClick={() => navigate("/dino-room")}
                >
                  디노 룸 가기
                </button>
              )}

              {!isDinoLoading && !myDino && (
                <button
                  type="button"
                  className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] cursor-pointer shadow-sm"
                  onClick={() => navigate("/onboarding/dino")}
                >
                  🦕 공룡 알 선택하러 가기
                </button>
              )}
            </article>

            {/* 오늘의 미션 요약 카드 */}
            <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-[#5F8C74] tracking-wider mb-2">TODAY MISSION</p>
                
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    오늘의 미션 ({missionProgressText})
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate("/missions")}
                    className="text-xs font-semibold text-[#5F8C74] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    전체보기 ➔
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  오늘 배정된 탄소 절감 미션을 완료하고 포인트와 EXP를 얻어보세요.
                </p>

                {/* 미션 간이 리스트 */}
                <div className="flex flex-col gap-2">
                  {isMissionLoading && <div className="text-xs text-gray-500 animate-pulse text-center py-2">Loading...</div>}
                  {!isMissionLoading && missionErrorMessage && (
                    <div className="text-xs text-[#E07A5F] text-center py-2">{missionErrorMessage}</div>
                  )}
                  {!isMissionLoading && !missionErrorMessage && missions.length === 0 && (
                    <div className="text-xs text-gray-500 text-center py-2">No missions assigned.</div>
                  )}
                  {!isMissionLoading && !missionErrorMessage && missions.slice(0, 2).map((m) => (
                    <div key={m.assignmentId} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8F2EC] flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-700 truncate max-w-[200px]">
                        {m.slot === "DAY" ? "Day" : m.slot === "EVENING" ? "Evening" : "Anytime"} - {m.title}
                      </span>
                      <span className="font-bold text-[#E07A5F] bg-[#FAF9F5] px-2 py-1 rounded-full border border-[#E07A5F]/20">
                        +{m.baseReward}P
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] cursor-pointer shadow-sm"
                onClick={() => navigate("/missions")}
              >
                미션 수행하러 가기
              </button>
            </article>
          </div>

        </div>
      </main>

      {/* 퀴즈 모달 */}
      {isQuizOpen && <EcoQuizModal onClose={() => setIsQuizOpen(false)} />}
    </div>
  );
}
