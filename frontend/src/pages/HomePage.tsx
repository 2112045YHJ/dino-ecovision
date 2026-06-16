// src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { EcoQuizModal } from "../components/quiz/EcoQuizModal";
import { logout } from "../api/authApi";
import { getMyDino, type MyDinoResponse } from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

import { mockHomeStatus } from "../mocks/homeMock";
import { mockTodayQuiz } from "../mocks/quizMock";

function getDinoTypeFromTemplateName(templateName: string): DinoType {
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

  return "SAURO";
}

export function HomePage() {
  const navigate = useNavigate();
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // 백엔드에서 받아온 내 공룡 정보
  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);

  // 내 공룡 정보를 불러오는 중인지 저장
  const [isDinoLoading, setIsDinoLoading] = useState(true);

  // 내 공룡 정보를 불러오지 못했을 때 메시지
  const [dinoErrorMessage, setDinoErrorMessage] = useState("");

  const homeStatus = mockHomeStatus;
  const missionProgressText = `${homeStatus.completedMissionCount} / ${homeStatus.todayMissionCount}`;
  const reserveBarWidth = Math.min(homeStatus.powerReserveRate * 5, 100);

  // 내 공룡 정보 로드
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

  // 로그아웃 버튼 액션
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

  // 내 공룡 이미지 계산
  const myDinoType = myDino
    ? getDinoTypeFromTemplateName(myDino.templateName)
    : null;

  const myDinoImage =
    myDino && myDinoType ? dinoImagesByType[myDinoType][myDino.stage] : null;

  /*
    nextStageExp 안전 처리

    기존 문제:
    myDino.nextStageExp가 null일 수도 있는데,
    바로 myDino.exp / myDino.nextStageExp 계산을 해서 빌드 오류가 났습니다.

    해결:
    1. nextStageExp가 null이면 최종 성장 단계로 봅니다.
    2. 최종 성장 단계면 EXP 퍼센트를 100%로 보여줍니다.
    3. 숫자가 있을 때만 나누기 계산을 합니다.
  */
  const myDinoNextStageExp = myDino?.nextStageExp ?? null;

  const myDinoIsMaxStage =
    myDino?.stage === "ADULT" || myDinoNextStageExp === null;

  const myDinoExpPercent = myDino
    ? myDinoIsMaxStage
      ? 100
      : Math.min((myDino.exp / myDinoNextStageExp) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      {/* 상단 글로벌 내비게이션 바 */}
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        {/* 상단 제목 및 로그아웃 버튼 영역 */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">ECOVISION</p>

            <h1 className="mt-1 text-3xl font-bold text-[#2C3531]">
              오늘의 탄소 절감 현황
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              전력 상황을 확인하고, 미션과 퀴즈로 공룡을 성장시켜보세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="self-start rounded-2xl border border-[#5F8C74] px-4 py-2 text-xs font-bold text-[#5F8C74] shadow-xs transition hover:bg-[#E8F2EC] cursor-pointer"
          >
            로그아웃
          </button>
        </header>

        {/* 던전 경고 영역 */}
        {homeStatus.dungeonActive && (
          <section className="mb-6 animate-pulse rounded-3xl bg-[#E07A5F] p-5 text-white shadow-sm">
            <p className="text-xs font-bold tracking-wider">DUNGEON ALERT</p>

            <h2 className="mt-1 text-lg font-bold">
              전력 예비율이 낮아 던전 상황이 발생했어요!
            </h2>

            <p className="mt-2 text-sm opacity-90">
              지금 미션을 완료하면 탄소 가중치가 반영된 보상을 받을 수 있어요.
            </p>
          </section>
        )}

        {/* 메인 2열 레이아웃 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 왼쪽 열: 탄소 시계 및 전력망 위젯 */}
          <div className="flex flex-col gap-6">
            {/* 지구 상태 탄소 시계 */}
            <article className="flex flex-col items-center rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
              <p className="mb-4 self-start text-xs font-bold tracking-wider text-[#5F8C74]">
                CARBON STATUS
              </p>

              <h2 className="mb-6 text-lg font-bold text-gray-800">
                지구 상태 탄소 시계
              </h2>

              {/* 지구 모양 원형 프로그래스 바 */}
              <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full border-8 border-[#5F8C74] bg-[#E8F2EC] shadow-inner">
                <span className="animate-bounce text-5xl">🌍</span>

                <span className="mt-2 rounded-full border border-[#5F8C74]/20 bg-white px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#5F8C74] shadow-sm">
                  PURIFIED
                </span>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm font-bold text-gray-700">
                  현재 탄소 집약도:{" "}
                  <span className="text-[#5F8C74]">240 gCO₂/kWh</span>
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  🌿 탄소 감축 가중치{" "}
                  <span className="font-bold text-[#E07A5F]">x1.0</span> 적용 중
                </p>
              </div>
            </article>

            {/* 실시간 전력 공급 예비율 */}
            <article className="flex flex-col gap-3 rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
                POWER GRID STATUS
              </p>

              <div className="flex items-end justify-between">
                <h3 className="text-sm font-bold text-gray-800">
                  실시간 전력 공급 예비율
                </h3>

                <span className="text-sm font-bold text-[#5F8C74]">
                  {homeStatus.powerReserveRate}% (안정)
                </span>
              </div>

              {/* 게이지 바 */}
              <div className="h-4 w-full overflow-hidden rounded-full bg-[#E8F2EC]">
                <div
                  className="h-full rounded-full bg-[#5F8C74] transition-all duration-500"
                  style={{ width: `${reserveBarWidth}%` }}
                />
              </div>

              <p className="text-xs leading-relaxed text-gray-500">
                전력 예비율이 10% 이하로 감소 시 비상{" "}
                <span className="font-bold text-[#E07A5F]">‘절전 던전’</span>이
                활성화되어 더 높은 포인트 획득 기회가 제공됩니다.
              </p>
            </article>

            {/* 에코 퀴즈 카드 */}
            <article className="flex flex-col justify-between rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-[#5F8C74]">
                  ECO QUIZ
                </p>

                <h2 className="text-lg font-bold text-gray-800">
                  오늘의 에코 퀴즈
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  하루 한 번 퀴즈를 풀고 30P 보상을 받을 수 있어요.
                </p>

                <div className="mt-4 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 text-xs">
                  {homeStatus.quizAvailable ? (
                    <p className="flex items-center gap-1 font-bold text-[#5F8C74]">
                      <span>💡</span> 아직 오늘의 퀴즈를 풀 수 있습니다!
                    </p>
                  ) : (
                    <p className="flex items-center gap-1 font-bold text-gray-500">
                      <span>✓</span> 오늘의 에코 퀴즈 참여를 완료하였습니다.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-[#E07A5F] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#c8654d] disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                disabled={!homeStatus.quizAvailable}
                onClick={() => setIsQuizOpen(true)}
              >
                퀴즈 풀기
              </button>
            </article>
          </div>

          {/* 오른쪽 열: 내 디노 및 미션 요약 */}
          <div className="flex flex-col gap-6">
            {/* 내 공룡 요약 카드 */}
            <article className="flex min-h-[300px] flex-col justify-between rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
              <div>
                <p className="mb-4 text-xs font-bold tracking-wider text-[#5F8C74]">
                  MY DINO
                </p>

                {isDinoLoading && (
                  <div className="rounded-2xl bg-[#FAF9F5] p-4 text-center text-xs font-bold text-gray-500 animate-pulse">
                    🦕 내 공룡 정보를 불러오는 중...
                  </div>
                )}

                {!isDinoLoading && dinoErrorMessage && (
                  <div className="rounded-2xl border border-[#E07A5F]/20 bg-[#FFF1EC] p-4 text-center text-xs font-bold text-[#E07A5F]">
                    <p>{dinoErrorMessage}</p>

                    <p className="mt-1 text-[10px] font-normal text-gray-500">
                      공룡 선택을 완료하지 않았다면 아래 버튼으로 가
                      분양받아주세요.
                    </p>
                  </div>
                )}

                {!isDinoLoading && myDino && myDinoImage && (
                  <div className="flex items-center gap-5">
                    {/* 디노 이미지 랩 */}
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-[#5F8C74]/10 bg-[#E8F2EC] shadow-sm">
                      <img
                        src={myDinoImage}
                        alt={`${myDino.nickname} 이미지`}
                        className="h-24 object-contain animate-wiggle"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-lg font-bold text-gray-800">
                          {myDino.nickname}
                        </h2>

                        <span className="rounded-full border border-[#5F8C74]/20 bg-[#E8F2EC] px-2 py-0.5 text-[10px] font-bold uppercase text-[#5F8C74]">
                          {myDino.stage}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        공룡 타입:{" "}
                        <span className="font-bold text-gray-700">
                          {myDino.templateName}
                        </span>
                      </p>

                      {/* 경험치 바 */}
                      <div className="mt-2">
                        <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                          <span>
                            EXP {myDino.exp} /{" "}
                            {myDinoIsMaxStage ? "MAX" : myDinoNextStageExp}
                          </span>

                          <span>{Math.round(myDinoExpPercent)}%</span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#5F8C74]"
                            style={{ width: `${myDinoExpPercent}%` }}
                          />
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        친밀도:{" "}
                        <span className="font-bold text-gray-700">
                          {myDino.affinity} / 100 ♡
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isDinoLoading && myDino && (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4d735f] cursor-pointer"
                    onClick={() => navigate("/dino-room")}
                  >
                    디노 룸 가기
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl border border-[#5F8C74] bg-white py-3 text-sm font-bold text-[#5F8C74] shadow-sm transition hover:bg-[#E8F2EC] cursor-pointer"
                    onClick={() => navigate("/dino-collection")}
                  >
                    디노 도감 보기
                  </button>
                </div>
              )}

              {!isDinoLoading && !myDino && (
                <button
                  type="button"
                  className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4d735f] cursor-pointer"
                  onClick={() => navigate("/onboarding/dino")}
                >
                  🦕 공룡 알 선택하러 가기
                </button>
              )}
            </article>

            {/* 오늘의 미션 요약 카드 */}
            <article className="flex flex-col justify-between rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-[#5F8C74]">
                  TODAY MISSION
                </p>

                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    오늘의 미션 ({missionProgressText})
                  </h2>

                  <button
                    type="button"
                    onClick={() => navigate("/missions")}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-semibold text-[#5F8C74] hover:underline"
                  >
                    전체보기 ➔
                  </button>
                </div>

                <p className="mb-4 text-sm text-gray-600">
                  오늘 배정된 탄소 절감 미션을 완료하고 포인트와 EXP를
                  얻어보세요.
                </p>

                {/* 미션 간이 리스트 */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-xl border border-[#E8F2EC] bg-[#FAF9F5] p-3 text-xs">
                    <span className="font-medium text-gray-700">
                      ☀️ 낮 - 불필요한 조명기구 소등하기
                    </span>

                    <span className="rounded-full border border-[#E07A5F]/20 bg-[#FAF9F5] px-2 py-1 font-bold text-[#E07A5F]">
                      +65P
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#E8F2EC] bg-[#FAF9F5] p-3 text-xs">
                    <span className="font-medium text-gray-700">
                      🌙 저녁 - 가전제품 대기전력 차단하기
                    </span>

                    <span className="rounded-full border border-[#E07A5F]/20 bg-[#FAF9F5] px-2 py-1 font-bold text-[#E07A5F]">
                      +50P
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4d735f] cursor-pointer"
                onClick={() => navigate("/missions")}
              >
                미션 수행하러 가기
              </button>
            </article>
          </div>
        </div>
      </main>

      {/* 퀴즈 모달 */}
      {isQuizOpen && (
        <EcoQuizModal
          quiz={mockTodayQuiz}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    </div>
  );
}
