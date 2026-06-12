// src/components/quiz/EcoQuizModal.tsx

import { useState } from "react";

import { submitQuizAnswer } from "../../api/quizApi";

import type {
  QuizOptionKey,
  SubmitQuizResult,
  TodayQuiz,
} from "../../types/quiz";

interface EcoQuizModalProps {
  quiz: TodayQuiz;
  onClose: () => void;
}

export function EcoQuizModal({ quiz, onClose }: EcoQuizModalProps) {
  // 사용자가 선택한 답입니다.
  const [selectedKey, setSelectedKey] = useState<QuizOptionKey | null>(null);

  // 제출이 끝났는지 저장합니다.
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 제출 중인지 저장합니다.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 백엔드에서 받은 채점 결과입니다.
  const [submitResult, setSubmitResult] = useState<SubmitQuizResult | null>(
    null,
  );

  // 에러 메시지입니다.
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!selectedKey) {
      alert("정답을 선택해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const result = await submitQuizAnswer(quiz.quizId, {
        answerKey: selectedKey,
      });

      setSubmitResult(result);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "퀴즈 제출에 실패했습니다.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <p className="text-sm font-bold text-[#5F8C74]">DAILY ECO QUIZ</p>

        <h2 className="mt-2 text-xl font-bold text-[#2C3531]">
          오늘의 에코 퀴즈
        </h2>

        <p className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-medium text-[#2C3531]">
          {quiz.question}
        </p>

        <div className="mt-4 grid gap-2">
          {quiz.options.map((option) => {
            const isSelected = selectedKey === option.key;
            const isCorrectAnswer =
              isSubmitted && submitResult?.correctAnswerKey === option.key;

            return (
              <button
                key={option.key}
                type="button"
                disabled={isSubmitted || isSubmitting}
                onClick={() => setSelectedKey(option.key)}
                className={`rounded-2xl border p-3 text-left text-sm transition ${
                  isCorrectAnswer
                    ? "border-[#5F8C74] bg-[#E8F2EC] font-bold text-[#5F8C74]"
                    : isSelected
                      ? "border-[#5F8C74] bg-[#E8F2EC] font-bold text-[#5F8C74]"
                      : "border-[#E8F2EC] bg-white text-gray-700 hover:bg-[#FAF9F5]"
                }`}
              >
                <span className="mr-2 font-bold">{option.key}.</span>
                {option.text}
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div className="mt-5 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
            {errorMessage}
          </div>
        )}

        {isSubmitted && submitResult && (
          <div className="mt-5 rounded-2xl bg-[#FAF9F5] p-4">
            <p
              className={`font-bold ${
                submitResult.correct ? "text-[#5F8C74]" : "text-[#E07A5F]"
              }`}
            >
              {submitResult.correct
                ? `정답입니다! +${submitResult.earnedPoint}P를 획득했어요.`
                : "아쉽지만 오답이에요."}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              정답: {submitResult.correctAnswerKey}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              {submitResult.explanation}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-2xl border border-[#E8F2EC] py-3 font-bold text-gray-600 disabled:bg-gray-100"
            onClick={onClose}
            disabled={isSubmitting}
          >
            닫기
          </button>

          {!isSubmitted && (
            <button
              type="button"
              className="flex-1 rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "제출 중..." : "정답 제출"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
