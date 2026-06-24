// src/App.tsx

import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { OnboardingProfilePage } from "./pages/OnboardingProfilePage";
import { DinoSelectionPage } from "./pages/DinoSelectionPage";
import { HomePage } from "./pages/HomePage";
import { TodayMissionPage } from "./pages/TodayMissionPage";
import { DinoRoomPage } from "./pages/DinoRoomPage";
import { DinoCollectionPage } from "./pages/DinoCollectionPage";

// 조원 추가 페이지
import { DinoGrowthComparePage } from "./pages/DinoGrowthComparePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { RegionMapLeaderboardPage } from "./pages/RegionMapLeaderboardPage";
import { GuildManagementPage } from "./pages/GuildManagementPage";
import { WorldDungeonPage } from "./pages/WorldDungeonPage";
import { AdminCsvUploadPage } from "./pages/AdminCsvUploadPage";
import { AdminDungeonPage } from "./pages/AdminDungeonPage";
import { RegionEnergyComparePage } from "./pages/RegionEnergyComparePage";
import { QuizTestPage } from "./pages/QuizTestPage";

// 커뮤니티 및 고도화 대시보드/마이페이지
import { MyPageBillInputPage } from "./pages/MyPageBillInputPage";
import { MyPageTrendChartPage } from "./pages/MyPageTrendChartPage";
import { CommunityPage } from "./pages/CommunityPage";
import { CommunityDetailPage } from "./pages/CommunityDetailPage";
import { CommunityWritePage } from "./pages/CommunityWritePage";
import { MyPage } from "./pages/MyPage";
import { Dashboard } from "./pages/Dashboard";
import { EmbedLandingPage } from "./pages/EmbedLandingPage";

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

      {/* 서비스 핵심 화면 라우트 */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/missions" element={<TodayMissionPage />} />
      <Route path="/dino-room" element={<DinoRoomPage />} />
      <Route path="/dino-collection" element={<DinoCollectionPage />} />
      <Route path="/dino-growth" element={<DinoGrowthComparePage />} />
      
      {/* 마이페이지 */}
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/:userId" element={<MyPage />} />
      <Route path="/mypage/edit" element={<MyPage />} />
      <Route path="/mypage/bills" element={<MyPageBillInputPage />} />
      <Route path="/mypage/trend" element={<MyPageTrendChartPage />} />

      {/* 리더보드, 길드, 던전 */}
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/region-ranking" element={<RegionMapLeaderboardPage />} />
      <Route path="/guild" element={<GuildManagementPage />} />
      <Route path="/world-dungeon" element={<WorldDungeonPage />} />

      {/* 대시보드 */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/embed/:id" element={<EmbedLandingPage />} />
      <Route path="/dashboard/compare" element={<RegionEnergyComparePage />} />

      {/* 커뮤니티 */}
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/:id" element={<CommunityDetailPage />} />
      <Route path="/community/write" element={<CommunityWritePage />} />
      <Route path="/community/edit/:id" element={<CommunityWritePage />} />

      {/* 관리자 페이지 */}
      <Route path="/admin/csv-upload" element={<AdminCsvUploadPage />} />
      <Route path="/admin/dungeon" element={<AdminDungeonPage />} />

      {/* 퀴즈 테스트 */}
      <Route path="/quiz" element={<QuizTestPage />} />

      {/* 없는 주소로 들어오면 로그인으로 보냅니다. */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
