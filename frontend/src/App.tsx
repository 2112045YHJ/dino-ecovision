// src/App.tsx

import { Navigate, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { TodayMissionPage } from "./pages/TodayMissionPage";
import { DinoRoomPage } from "./pages/DinoRoomPage";
import { QuizTestPage } from "./pages/QuizTestPage";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingProfilePage } from "./pages/OnboardingProfilePage";
import { DinoSelectionPage } from "./pages/DinoSelectionPage";
import { CommunityPage } from "./pages/CommunityPage";
import { CommunityDetailPage } from "./pages/CommunityDetailPage";
import { CommunityWritePage } from "./pages/CommunityWritePage";
import { MyPage } from "./pages/MyPage";
import { Dashboard } from "./pages/Dashboard";

import { LeaderboardPage } from "./pages/LeaderboardPage";
import { GuildManagementPage } from "./pages/GuildManagementPage";
import { AdminCsvUploadPage } from "./pages/AdminCsvUploadPage";
import { RegionMapLeaderboardPage } from "./pages/RegionMapLeaderboardPage";
import { WorldDungeonPage } from "./pages/WorldDungeonPage";
import { DinoCollectionPage } from "./pages/DinoCollectionPage";

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

      {/* 퀴즈 테스트 */}
      <Route path="/quiz" element={<QuizTestPage />} />

      {/* 대시보드 */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 커뮤니티 */}
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/:id" element={<CommunityDetailPage />} />
      <Route path="/community/write" element={<CommunityWritePage />} />

      {/* 마이페이지 */}
      <Route path="/mypage" element={<MyPage />} />

      {/* 추가 mock 화면 */}
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/guild" element={<GuildManagementPage />} />
      <Route path="/admin/csv-upload" element={<AdminCsvUploadPage />} />
      <Route path="/region-ranking" element={<RegionMapLeaderboardPage />} />
      <Route path="/world-dungeon" element={<WorldDungeonPage />} />

      {/* 없는 주소로 들어오면 로그인으로 보냅니다. */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/dino-collection" element={<DinoCollectionPage />} />
    </Routes>
  );
}

export default App;
