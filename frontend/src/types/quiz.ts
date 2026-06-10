// src/types/quiz.ts

// 퀴즈 선택지 한 개의 데이터 모양입니다.
export interface QuizOption {
  key: "A" | "B" | "C"; // 선택지 번호
  text: string; // 선택지 내용
}

// 퀴즈 한 문제의 데이터 모양입니다.
export interface Quiz {
  quizId: number; // 퀴즈 ID
  question: string; // 문제 내용
  options: QuizOption[]; // 선택지 목록
  answerKey: "A" | "B" | "C"; // 정답
  explanation: string; // 해설
  rewardPoint: number; // 정답 보상
}
