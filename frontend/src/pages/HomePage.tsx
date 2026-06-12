// src/pages/HomePage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { EcoQuizModal } from "../components/quiz/EcoQuizModal";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

import { mockHomeStatus } from "../mocks/homeMock";
import { mockMyDino } from "../mocks/dinoMock";
import { mockTodayQuiz } from "../mocks/quizMock";

interface StoredDino {
  type: DinoType;
  name: string;
  stage: DinoStage;
  exp: number;
  maxExp: number;
  affinity: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const dino = mockMyDino;
  const homeStatus = mockHomeStatus;

  const savedDinoText = localStorage.getItem("myDino");
  const savedDino = savedDinoText
    ? (JSON.parse(savedDinoText) as StoredDino)
    : null;

  const homeDino: StoredDino = savedDino ?? {
    type: "SAURO",
    name: dino.name,
    stage: dino.stage as DinoStage,
    exp: dino.exp,
    maxExp: dino.requiredExp,
    affinity: dino.intimacy,
  };

  const homeDinoImage = dinoImagesByType[homeDino.type][homeDino.stage];
  const missionProgressText = `${homeStatus.completedMissionCount} / ${homeStatus.todayMissionCount}`;
  const reserveBarWidth = Math.min(homeStatus.powerReserveRate * 5, 100);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      {/* 상단 글로벌 내비게이션 바 */}
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        {/* 상단 제목 영역 */}
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">ECOVISION</p>
          <h1 className="mt-1 text-3xl font-bold text-[#2C3531]">오늘의 탄소 절감 현황</h1>
          <p className="mt-1 text-sm text-gray-600">
            전력 상황을 확인하고, 미션과 퀴즈로 공룡을 성장시켜보세요.
          </p>
        </header>

        {/* 던전 경고 영역 */}
        {homeStatus.dungeonActive && (
          <section className="mb-6 rounded-3xl bg-[#E07A5F] p-5 text-white shadow-sm animate-pulse">
            <p className="text-xs font-bold tracking-wider">DUNGEON ALERT</p>
            <h2 className="mt-1 text-lg font-bold">
              전력 예비율이 낮아 던전 상황이 발생했어요!
            </h2>
            <p className="mt-2 text-sm opacity-90">
              지금 미션을 완료하면 탄소 가중치가 반영된 보상을 받을 수 있어요.
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
              
              {/* 지구 모양 원형 프로그래스 바 (스토리보드 반영) */}
              <div className="relative w-36 h-36 rounded-full border-8 border-[#5F8C74] bg-[#E8F2EC] flex flex-col justify-center items-center shadow-inner">
                <span className="text-5xl animate-bounce">🌍</span>
                <span className="text-[10px] font-bold text-[#5F8C74] mt-2 tracking-widest bg-white px-2 py-0.5 rounded-full border border-[#5F8C74]/20 shadow-sm">
                  PURIFIED
                </span>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm font-bold text-gray-700">
                  현재 탄소 집약도: <span className="text-[#5F8C74]">240 gCO₂/kWh</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  🌿 탄소 감축 가중치 <span className="font-bold text-[#E07A5F]">x1.0</span> 적용 중
                </p>
              </div>
            </article>

            {/* 실시간 전력 공급 예비율 */}
            <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col gap-3">
              <p className="text-xs font-bold text-[#5F8C74] tracking-wider">POWER GRID STATUS</p>
              
              <div className="flex justify-between items-end">
                <h3 className="text-sm font-bold text-gray-800">실시간 전력 공급 예비율</h3>
                <span className="text-sm font-bold text-[#5F8C74]">
                  {homeStatus.powerReserveRate}% (안정)
                </span>
              </div>

              {/* 게이지 바 */}
              <div className="h-4 w-full bg-[#E8F2EC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5F8C74] rounded-full transition-all duration-500"
                  style={{ width: `${reserveBarWidth}%` }}
                />
              </div>

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
                
                <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 border border-[#E8F2EC] text-xs">
                  {homeStatus.quizAvailable ? (
                    <p className="font-bold text-[#5F8C74] flex items-center gap-1">
                      <span>💡</span> 아직 오늘의 퀴즈를 풀 수 있습니다!
                    </p>
                  ) : (
                    <p className="font-bold text-gray-500 flex items-center gap-1">
                      <span>✓</span> 오늘의 에코 퀴즈 참여를 완료하였습니다.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-[#E07A5F] py-3 text-sm font-bold text-white transition hover:bg-[#c8654d] disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed shadow-sm"
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
            <article className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-[#5F8C74] tracking-wider mb-4">MY DINO</p>
                
                <div className="flex items-center gap-5">
                  {/* 디노 이미지 랩 */}
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-[#E8F2EC] border border-[#5F8C74]/10 shadow-sm">
                    <img
                      src={homeDinoImage}
                      alt={`${homeDino.name} 이미지`}
                      className="h-24 object-contain animate-wiggle"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-800 truncate">{homeDino.name}</h2>
                      <span className="text-[10px] font-bold text-[#5F8C74] bg-[#E8F2EC] px-2 py-0.5 rounded-full uppercase border border-[#5F8C74]/20">
                        {homeDino.stage}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      공룡 타입: <span className="font-bold text-gray-700">{homeDino.type}</span>
                    </p>
                    
                    {/* 경험치 바 */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>EXP {homeDino.exp} / {homeDino.maxExp}</span>
                        <span>{Math.round((homeDino.exp / homeDino.maxExp) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5F8C74] rounded-full"
                          style={{ width: `${Math.min((homeDino.exp / homeDino.maxExp) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      친밀도: <span className="font-bold text-gray-700">{homeDino.affinity} / 100 ♡</span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] cursor-pointer shadow-sm"
                onClick={() => navigate("/dino-room")}
              >
                디노 룸 가기
              </button>
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

                {/* 미션 간이 리스트 (스토리보드 반영) */}
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8F2EC] flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-700">☀️ 낮 - 불필요한 조명기구 소등하기</span>
                    <span className="font-bold text-[#E07A5F] bg-[#FAF9F5] px-2 py-1 rounded-full border border-[#E07A5F]/20">+65P</span>
                  </div>
                  <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8F2EC] flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-700">🌙 저녁 - 가전제품 대기전력 차단하기</span>
                    <span className="font-bold text-[#E07A5F] bg-[#FAF9F5] px-2 py-1 rounded-full border border-[#E07A5F]/20">+50P</span>
                  </div>
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
      {isQuizOpen && (
        <EcoQuizModal
          quiz={mockTodayQuiz}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    </div>
  );
}

