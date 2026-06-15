// src/pages/MyPageMainPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMySummary, type MyPageSummary } from "../api/mypageApi";

function formatNumber(value?: number) {
  return value ?? 0;
}

export function MyPageMainPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<MyPageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMySummary();

        setSummary(data);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "마이페이지 정보를 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">MY PAGE</p>

            <h1 className="mt-2 text-3xl font-bold">마이페이지</h1>

            <p className="mt-2 text-sm text-gray-600">
              내 포인트, 미션 기록, 공룡 성장 정보를 한눈에 확인해요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            홈으로 이동
          </button>
        </header>

        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            마이페이지 정보를 불러오는 중입니다...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && summary && (
          <>
            <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#5F8C74]">PROFILE</p>

              <h2 className="mt-2 text-2xl font-bold">
                {summary.nickname ?? "이름 없는 사용자"}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                이메일: {summary.email ?? "-"}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                지역: {summary.regionName ?? "지역 정보 없음"}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <article className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">누적 포인트</p>
                <p className="mt-2 text-3xl font-bold text-[#5F8C74]">
                  {formatNumber(summary.totalPoints)} AP
                </p>
              </article>

              <article className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">랭킹 점수</p>
                <p className="mt-2 text-3xl font-bold text-[#E07A5F]">
                  {formatNumber(summary.rankingPoint)} 점
                </p>
              </article>

              <article className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">완료한 미션</p>
                <p className="mt-2 text-3xl font-bold text-[#2C3531]">
                  {formatNumber(summary.completedMissionCount)} 개
                </p>
              </article>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-[#5F8C74]">MY DINO</p>

                <h2 className="mt-2 text-2xl font-bold">
                  {summary.dinoNickname ?? "공룡 정보 없음"}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  성장 단계: {summary.dinoStage ?? "-"}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/dino-room")}
                  className="mt-5 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
                >
                  디노룸으로 이동
                </button>
              </article>

              <article className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-[#5F8C74]">
                  CARBON RECORD
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  예상 감축량 {formatNumber(summary.estimatedReductionKg)} kg
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  생활 미션과 사용량 입력을 바탕으로 나의 절감 흐름을 확인할 수
                  있어요.
                </p>

                <div className="mt-5 grid gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/bills")}
                    className="w-full rounded-2xl bg-[#E07A5F] py-3 text-sm font-bold text-white transition hover:bg-[#c8654d]"
                  >
                    사용량 입력하기
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/mypage/trend")}
                    className="w-full rounded-2xl border border-[#5F8C74] bg-white py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
                  >
                    사용량 추이 보기
                  </button>
                </div>
              </article>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
