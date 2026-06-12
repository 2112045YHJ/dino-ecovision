// src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../api/authApi";
import { getMyDino, type MyDinoResponse } from "../api/dinoApi";

import { EcoQuizModal } from "../components/quiz/EcoQuizModal";

import { dinoImagesByType } from "../assets/images/dinos/dinoImages";

import { mockHomeStatus } from "../mocks/homeMock";
import { mockTodayQuiz } from "../mocks/quizMock";

export function HomePage() {
  // 페이지 이동을 도와주는 함수입니다.
  const navigate = useNavigate();

  // 퀴즈 모달이 열려 있는지 저장합니다.
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // 백엔드에서 받아온 내 공룡 정보입니다.
  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);

  // 내 공룡 정보를 불러오는 중인지 저장합니다.
  const [isDinoLoading, setIsDinoLoading] = useState(true);

  // 내 공룡 정보를 불러오지 못했을 때 메시지입니다.
  const [dinoErrorMessage, setDinoErrorMessage] = useState("");

  // 미션/퀴즈/전력 상태는 아직 실제 API가 없으므로 Mock 데이터를 사용합니다.
  const homeStatus = mockHomeStatus;

  // 오늘의 미션 진행 상황 텍스트입니다.
  const missionProgressText = `${homeStatus.completedMissionCount} / ${homeStatus.todayMissionCount}`;

  // 전력 예비율 바의 너비입니다.
  // 예비율 9.8%처럼 숫자가 작으면 화면에서 너무 짧게 보여서 임시로 5배 해서 표시합니다.
  const reserveBarWidth = Math.min(homeStatus.powerReserveRate * 5, 100);

  // 홈 화면이 처음 열릴 때 내 공룡 정보를 백엔드에서 가져옵니다.
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

  // 로그아웃 버튼을 눌렀을 때 실행됩니다.
  const handleLogout = async () => {
    try {
      // 1. 백엔드 로그아웃 API 호출
      await logout();
    } catch (error) {
      // 서버 로그아웃이 실패해도 프론트에서는 토큰을 지워줍니다.
      console.error(error);
    } finally {
      // 2. 프론트에 저장된 로그인 정보 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("myDino");

      // 3. 로그인 화면으로 이동
      navigate("/login");
    }
  };

  // 백엔드에서 받은 templateCode를 그대로 사용합니다.
  // 예: TYRANO / SAURO / CERATO
  const myDinoType = myDino ? myDino.templateCode : null;

  // 내 공룡 이미지 계산
  const myDinoImage =
    myDino && myDinoType ? dinoImagesByType[myDinoType][myDino.stage] : null;

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
        {homeStatus.dungeonActive && (
          <section className="mb-4 rounded-3xl bg-[#E07A5F] p-5 text-white shadow-sm">
            <p className="text-sm font-bold">DUNGEON ALERT</p>

            <h2 className="mt-1 text-xl font-bold">
              전력 예비율이 낮아 던전 상황이 발생했어요
            </h2>

            <p className="mt-2 text-sm">
              지금 미션을 완료하면 탄소 가중치가 반영된 보상을 받을 수 있어요.
            </p>
          </section>
        )}

        {/* 카드 그리드 영역 */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* 탄소 / 전력 상태 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">CARBON STATUS</p>

            <h2 className="mt-2 text-2xl font-bold">
              탄소 상태: {homeStatus.carbonStatus}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              현재 전력 예비율은 {homeStatus.powerReserveRate}%입니다.
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

            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
              <div className="flex justify-between">
                <span>전체 미션</span>
                <span>{homeStatus.todayMissionCount}개</span>
              </div>

              <div className="mt-1 flex justify-between">
                <span>완료한 미션</span>
                <span>{homeStatus.completedMissionCount}개</span>
              </div>

              <div className="mt-1 flex justify-between font-bold text-[#E07A5F]">
                <span>남은 미션</span>
                <span>
                  {homeStatus.todayMissionCount -
                    homeStatus.completedMissionCount}
                  개
                </span>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
              onClick={() => navigate("/missions")}
            >
              미션 보러가기
            </button>
          </article>

          {/* 에코 퀴즈 카드 */}
          <article className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">ECO QUIZ</p>

            <h2 className="mt-2 text-2xl font-bold">오늘의 에코 퀴즈</h2>

            <p className="mt-2 text-sm text-gray-600">
              하루 한 번 퀴즈를 풀고 30P 보상을 받을 수 있어요.
            </p>

            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
              {homeStatus.quizAvailable ? (
                <p className="font-bold text-[#5F8C74]">
                  아직 오늘의 퀴즈를 풀 수 있어요.
                </p>
              ) : (
                <p className="font-bold text-gray-500">
                  오늘의 퀴즈를 이미 완료했어요.
                </p>
              )}
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[#E07A5F] py-3 font-bold text-white transition hover:bg-[#c8654d] disabled:bg-gray-300"
              disabled={!homeStatus.quizAvailable}
              onClick={() => setIsQuizOpen(true)}
            >
              퀴즈 풀기
            </button>
          </article>
        </section>
      </section>

      {/* 퀴즈 모달 */}
      {isQuizOpen && (
        <EcoQuizModal
          quiz={mockTodayQuiz}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    </main>
  );
}
