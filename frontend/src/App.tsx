// src/App.tsx

import { Navigate, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { TodayMissionPage } from "./pages/TodayMissionPage";
import { DinoRoomPage } from "./pages/DinoRoomPage";
import { QuizTestPage } from "./pages/QuizTestPage";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingProfilePage } from "./pages/OnboardingProfilePage";
import { DinoSelectionPage } from "./pages/DinoSelectionPage";
import { DinoCollectionPage } from "./pages/DinoCollectionPage";
import { MyPageMainPage } from "./pages/MyPageMainPage";
import { MyPageBillInputPage } from "./pages/MyPageBillInputPage";
import { MyPageTrendChartPage } from "./pages/MyPageTrendChartPage";

function App() {
  return (
    <Routes>
      {/* 처음 접속하면 로그인 화면으로 보냅니다. */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 로그인 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 온보딩 1단계: 닉네임 / 지역 설정 */}
      <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />

      {/* 온보딩 2단계: 공룡 선택 */}
      <Route path="/onboarding/dino" element={<DinoSelectionPage />} />

      {/* 혹시 기존 코드에서 /dino-selection으로 이동해도 깨지지 않도록 임시 연결 */}
      <Route
        path="/dino-selection"
        element={<Navigate to="/onboarding/dino" replace />}
      />

      {/* 메인 홈 */}
      <Route path="/home" element={<HomePage />} />

      {/* 오늘의 미션 */}
      <Route path="/missions" element={<TodayMissionPage />} />

      {/* 디노룸 */}
      <Route path="/dino-room" element={<DinoRoomPage />} />

      {/* 디노 도감 */}
      <Route path="/dino-collection" element={<DinoCollectionPage />} />

      {/* 퀴즈 테스트 */}
      <Route path="/quiz" element={<QuizTestPage />} />

      {/* 마이페이지 */}
      <Route path="/mypage" element={<MyPageMainPage />} />
      <Route path="/mypage/bills" element={<MyPageBillInputPage />} />
      <Route path="/mypage/trend" element={<MyPageTrendChartPage />} />

      {/* 없는 주소로 들어오면 로그인으로 보냅니다. */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
