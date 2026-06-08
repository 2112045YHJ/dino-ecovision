// src/mocks/quizMock.ts

import type { Quiz } from "../types/quiz";

// 백엔드 API가 완성되기 전까지 사용할 가짜 퀴즈 데이터입니다.
export const mockTodayQuiz: Quiz = {
  quizId: 1,
  question:
    "사용하지 않는 가전제품의 플러그를 뽑는 행동은 무엇을 줄이는 데 도움이 될까요?",
  options: [
    {
      key: "A",
      text: "대기전력",
    },
    {
      key: "B",
      text: "인터넷 속도",
    },
    {
      key: "C",
      text: "휴대폰 배터리",
    },
  ],
  answerKey: "A",
  explanation:
    "사용하지 않는 전자제품도 플러그가 꽂혀 있으면 전기를 조금씩 사용할 수 있어요. 이것을 대기전력이라고 합니다.",
  rewardPoint: 30,
};
