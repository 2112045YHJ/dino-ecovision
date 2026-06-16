// src/types/quiz.ts

export type QuizOption = {
  optionNo?: number;

  // 백엔드 응답 오타 방어용
  // 원래는 optionNo가 맞지만, optioinNo로 내려오는 경우도 임시 대응
  optioinNo?: number;

  text: string;
};

export type TodayQuiz = {
  quizId: number;
  question: string;
  options: QuizOption[];
  reward: number;
  attempted: boolean;
  correct: boolean | null;
};

export type SubmitQuizRequest = {
  optionNo: number;
};

export type SubmitQuizResult = {
  correct: boolean;
  answerNo: number;

  // 정상 필드
  explanation?: string;

  // 백엔드 응답 오타 방어용
  explantaion?: string;

  rewardGranted: number;
};
