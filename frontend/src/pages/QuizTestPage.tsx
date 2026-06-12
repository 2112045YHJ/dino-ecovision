// src/pages/QuizTestPage.tsx

import { useEffect, useState } from "react";

import { getTodayQuiz } from "../api/quizApi";
import { EcoQuizModal } from "../components/quiz/EcoQuizModal";

import type { TodayQuiz } from "../types/quiz";

export function QuizTestPage() {
  // 퀴즈 모달 열림 여부입니다.
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // 백엔드에서 받아온 오늘의 퀴즈입니다.
  const [quiz, setQuiz] = useState<TodayQuiz | null>(null);

  // 퀴즈를 불러오는 중인지 저장합니다.
  const [isLoading, setIsLoading] = useState(true);

  // 에러 메시지입니다.
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTodayQuiz = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getTodayQuiz();

        setQuiz(data);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "오늘의 퀴즈를 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayQuiz();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">ECO QUIZ</p>

          <h1 className="mt-2 text-3xl font-bold">에코 퀴즈 테스트</h1>

          <p className="mt-2 text-sm text-gray-600">
            하루 한 번 에코 퀴즈를 풀고 보상을 받을 수 있어요.
          </p>

          {isLoading && (
            <div className="mt-6 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
              오늘의 퀴즈를 불러오는 중...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="mt-6 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
              {errorMessage}
            </div>
          )}

          {!isLoading && quiz && (
            <button
              type="button"
              className="mt-6 rounded-2xl bg-[#5F8C74] px-5 py-3 font-bold text-white transition hover:bg-[#4d735f]"
              onClick={() => setIsQuizOpen(true)}
            >
              오늘의 퀴즈 풀기
            </button>
          )}

          {!isLoading && !quiz && !errorMessage && (
            <div className="mt-6 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
              오늘 풀 수 있는 퀴즈가 없습니다.
            </div>
          )}
        </div>
      </section>

      {isQuizOpen && quiz && (
        <EcoQuizModal quiz={quiz} onClose={() => setIsQuizOpen(false)} />
      )}
    </main>
  );
}
