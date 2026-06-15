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

  현재 실제 구현된 API 기준으로만 구성합니다.

  1. 내 공룡 정보 조회
     GET /api/me/dino

  2. 오늘의 미션 목록 조회
     GET /api/missions/today

  3. 퀴즈 모달 열기
     EcoQuizModal 내부에서 GET /api/quiz/today 호출

  현재 구현 API 목록에 없는 기능은 직접 호출하지 않고,
  "준비 중" 카드로 표시합니다.
*/

/* =========================
   공룡 안전 처리 함수
   ========================= */

function getSafeDinoType(dino?: MyDinoResponse | null): DinoType {
  const templateCode = String(dino?.templateCode ?? "").toUpperCase();
  const templateName = String(dino?.templateName ?? "").toUpperCase();

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

  if (safeStage === "EGG") {
    return "EGG";
  }

  if (safeStage === "HATCHLING") {
    return "HATCHLING";
  }

  if (safeStage === "JUVENILE") {
    return "JUVENILE";
  }

  if (safeStage === "ADULT") {
    return "ADULT";
  }

  return "EGG";
}

function getStageLabel(stage: DinoStage) {
  if (stage === "EGG") {
    return "알";
  }

  if (stage === "HATCHLING") {
    return "유아기";
  }

  if (stage === "JUVENILE") {
    return "청소년기";
  }

  if (stage === "ADULT") {
    return "성룡";
  }

  return "알";
}

/* =========================
   HomePage 컴포넌트
   ========================= */

export function HomePage() {
  const navigate = useNavigate();

  // 퀴즈 모달 열림/닫힘 상태입니다.
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // 내 공룡 상태입니다.
  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);
  const [isDinoLoading, setIsDinoLoading] = useState(true);
  const [dinoErrorMessage, setDinoErrorMessage] = useState("");

  // 오늘의 미션 상태입니다.
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isMissionLoading, setIsMissionLoading] = useState(true);
  const [missionErrorMessage, setMissionErrorMessage] = useState("");

  // 홈 화면이 처음 열릴 때 내 공룡 정보를 가져옵니다.
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

  // 홈 화면이 처음 열릴 때 오늘의 미션 목록을 가져옵니다.
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

  // 로그아웃 버튼을 눌렀을 때 실행됩니다.
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

  // 미션 개수 계산입니다.
  const totalMissionCount = missions.length;

  const completedMissionCount = missions.filter(
    (mission) => mission.completed,
  ).length;

  const remainingMissionCount = totalMissionCount - completedMissionCount;

  const missionProgressText = `${completedMissionCount} / ${totalMissionCount}`;

  // 공룡 이미지 계산입니다.
  const safeDinoType = getSafeDinoType(myDino);
  const safeDinoStage = getSafeDinoStage(myDino?.stage);
  const safeDinoStageLabel = getStageLabel(safeDinoStage);

  const myDinoImage = myDino
    ? dinoImagesByType[safeDinoType][safeDinoStage]
    : null;

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
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
              onClick={() => navigate("/mypage")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              마이페이지
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-[#E07A5F] px-4 py-2 text-sm font-bold text-[#E07A5F] transition hover:bg-[#FFF0EA]"
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* 카드 그리드 영역 */}
        <section className="grid gap-4 md:grid-cols-2">
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

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
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

                    <p className="mt-1 text-sm text-gray-600">
                      종류: {myDino.templateName}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      성장 단계: {safeDinoStageLabel}
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

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                    onClick={() => navigate("/dino-room")}
                  >
                    디노룸 가기
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-[#5F8C74] bg-white py-3 font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
                    onClick={() => navigate("/dino-collection")}
                  >
                    디노도감 보기
                  </button>
                </div>
              </>
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

          {/* 탄소 / 전력 상태 준비 중 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">CARBON STATUS</p>

            <h2 className="mt-2 text-2xl font-bold">탄소 상태 준비 중</h2>

            <p className="mt-2 text-sm text-gray-600">
              현재 백엔드 구현 API 목록에는 실시간 탄소/전력 상태 API가 아직
              포함되어 있지 않아서 준비 중으로 표시합니다.
            </p>

            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm text-gray-600">
              추후 전력/탄소 데이터 API가 연결되면 이 영역에서 현재 전력
              예비율과 탄소 상태를 보여줄 수 있어요.
            </div>
          </article>

          {/* 던전 준비 중 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">DUNGEON</p>

            <h2 className="mt-2 text-2xl font-bold">던전 기능 준비 중</h2>

            <p className="mt-2 text-sm text-gray-600">
              현재 구현된 API 목록에는 던전 조회 API가 없어서 홈에서는 준비
              중으로 표시합니다.
            </p>

            <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm text-[#E07A5F]">
              전력 피크 상황과 연결되면 던전 미션과 보상 배율을 보여줄 수
              있어요.
            </div>
          </article>

          {/* 에코 퀴즈 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm md:col-span-2">
            <p className="text-sm font-bold text-[#5F8C74]">ECO QUIZ</p>

            <h2 className="mt-2 text-2xl font-bold">오늘의 에코 퀴즈</h2>

            <p className="mt-2 text-sm text-gray-600">
              하루 한 번 퀴즈를 풀고 보상을 받을 수 있어요.
            </p>

            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
              <p className="font-bold text-[#5F8C74]">
                퀴즈 API가 연결되어 있습니다.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                버튼을 누르면 오늘의 퀴즈를 불러오고 정답을 제출할 수 있어요.
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
