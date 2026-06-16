// src/components/quiz/EcoQuizModal.tsx

import { useEffect, useState } from "react";

import { getTodayQuiz, submitQuizAnswer } from "../../api/quizApi";
import type { SubmitQuizResult, TodayQuiz } from "../../types/quiz";

type EcoQuizModalProps = {
  onClose: () => void;
};

function getOptionNo(option: { optionNo?: number; optioinNo?: number }) {
  return option.optionNo ?? option.optioinNo;
}

function getExplanation(result: SubmitQuizResult) {
  return result.explanation ?? result.explantaion ?? "해설 정보가 없습니다.";
}

export function EcoQuizModal({ onClose }: EcoQuizModalProps) {
  const [quiz, setQuiz] = useState<TodayQuiz | null>(null);
  const [selectedOptionNo, setSelectedOptionNo] = useState<number | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitQuizResult | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getTodayQuiz();

        setQuiz(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("오늘의 퀴즈를 불러오지 못했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  const handleSubmit = async () => {
    if (!quiz || selectedOptionNo === null) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const result = await submitQuizAnswer(quiz.quizId, {
        optionNo: selectedOptionNo,
      });

      setSubmitResult(result);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("퀴즈 제출에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const alreadyAttempted = quiz?.attempted === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <header className="text-center">
          <p className="text-sm font-bold text-[#5F8C74]">ECO QUIZ</p>

          <h2 className="mt-2 text-xl font-bold text-[#2C3531]">
            오늘의 데일리 에코 퀴즈
          </h2>
        </header>

        {isLoading && (
          <div className="mt-5 rounded-2xl bg-[#FAF9F5] p-4 text-center text-sm font-bold text-gray-500">
            퀴즈를 불러오는 중입니다...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="mt-5 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
            {errorMessage}
          </div>
        )}

        {!isLoading && quiz && (
          <>
            <div className="mt-5 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 text-sm leading-6">
              <strong>Q. {quiz.question}</strong>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {quiz.options.map((option) => {
                const optionNo = getOptionNo(option);

                if (optionNo === undefined) {
                  return null;
                }

                const isSelected = selectedOptionNo === optionNo;
                const isAnswer =
                  submitResult !== null && submitResult.answerNo === optionNo;

                return (
                  <button
                    key={optionNo}
                    type="button"
                    disabled={alreadyAttempted || submitResult !== null}
                    onClick={() => setSelectedOptionNo(optionNo)}
                    className={[
                      "rounded-2xl border px-4 py-3 text-left text-sm font-bold transition",
                      isSelected
                        ? "border-[#5F8C74] bg-[#E8F2EC] text-[#5F8C74]"
                        : "border-[#E8F2EC] bg-white text-[#2C3531]",
                      isAnswer ? "border-[#E07A5F] bg-[#FFF0EA]" : "",
                    ].join(" ")}
                  >
                    {optionNo}번) {option.text}
                  </button>
                );
              })}
            </div>

            {alreadyAttempted && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-[#5F8C74]">
                오늘의 퀴즈는 이미 참여했습니다.
              </div>
            )}

            {submitResult && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
                <p className="font-bold text-[#5F8C74]">
                  {submitResult.correct ? "정답입니다!" : "오답입니다."}
                </p>

                <p className="mt-2 text-gray-700">
                  정답 번호: {submitResult.answerNo}번
                </p>

                <p className="mt-2 leading-6 text-gray-700">
                  {getExplanation(submitResult)}
                </p>

                <p className="mt-2 font-bold text-[#E07A5F]">
                  지급 보상: +{submitResult.rewardGranted} AP
                </p>
              </div>
            )}
          </>
        )}

        <footer className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-600"
          >
            닫기
          </button>

          <button
            type="button"
            disabled={
              isLoading ||
              isSubmitting ||
              alreadyAttempted ||
              submitResult !== null ||
              selectedOptionNo === null
            }
            onClick={handleSubmit}
            className="flex-1 rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "제출 중..." : `정답 제출`}
          </button>
        </footer>
      </section>
    </div>
  );
}
