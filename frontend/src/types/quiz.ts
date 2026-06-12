// src/types/quiz.ts

// 퀴즈 선택지 번호입니다.
// A, B, C 중 하나만 사용할 수 있게 제한합니다.
export type QuizOptionKey = "A" | "B" | "C";

// 퀴즈 선택지 한 개의 데이터 모양입니다.
export type QuizOption = {
  key: QuizOptionKey; // 선택지 번호
  text: string; // 선택지 내용
};

// 오늘의 퀴즈 조회 응답 타입입니다.
// GET /api/quiz/today 응답에서 사용합니다.
// 실제 서비스에서는 정답(answerKey)을 여기서 받지 않는 것이 좋습니다.
export type TodayQuiz = {
  quizId: number; // 퀴즈 ID
  question: string; // 문제 내용
  options: QuizOption[]; // 선택지 목록
  rewardPoint: number; // 정답 보상
};

// 퀴즈 제출 요청 타입입니다.
// POST /api/quiz/{quizId}/submit 요청 body에서 사용합니다.
export type SubmitQuizRequest = {
  answerKey: QuizOptionKey; // 사용자가 선택한 답
};

// 퀴즈 제출 결과 타입입니다.
// POST /api/quiz/{quizId}/submit 응답에서 사용합니다.
export type SubmitQuizResult = {
  quizId: number; // 퀴즈 ID
  correct: boolean; // 정답 여부
  correctAnswerKey: QuizOptionKey; // 실제 정답
  explanation: string; // 해설
  earnedPoint: number; // 획득 포인트
  alreadySolved?: boolean; // 이미 푼 퀴즈인지 여부
};

// mock 테스트용 타입입니다.
// 기존 mockTodayQuiz는 프론트에서 정답을 직접 비교하기 때문에 answerKey와 explanation이 필요합니다.
// 나중에 mock을 완전히 제거하면 이 타입도 지워도 됩니다.
export type MockQuiz = TodayQuiz & {
  answerKey: QuizOptionKey;
  explanation: string;
};
