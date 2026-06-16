// src/pages/QuizTestPage.tsx

import { useState } from "react";

import { EcoQuizModal } from "../components/quiz/EcoQuizModal";

export function QuizTestPage() {
  // 퀴즈 모달이 열려 있는지 저장하는 상태입니다.
  // false = 닫힘
  // true = 열림
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">ECO QUIZ</p>

          <h1 className="mt-2 text-3xl font-bold">에코 퀴즈 테스트</h1>

          <p className="mt-2 text-sm text-gray-600">
            하루 한 번 에코 퀴즈를 풀고 보상을 받을 수 있어요.
          </p>

          <button
            type="button"
            className="mt-6 rounded-2xl bg-[#5F8C74] px-5 py-3 font-bold text-white transition hover:bg-[#4d735f]"
            onClick={() => setIsQuizOpen(true)}
          >
            오늘의 퀴즈 풀기
          </button>
        </div>
      </section>

      {isQuizOpen && <EcoQuizModal onClose={() => setIsQuizOpen(false)} />}
    </main>
  );
}
