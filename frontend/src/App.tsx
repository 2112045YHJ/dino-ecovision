// src/App.tsx

import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { OnboardingProfilePage } from "./pages/OnboardingProfilePage";
import { DinoSelectionPage } from "./pages/DinoSelectionPage";
import { HomePage } from "./pages/HomePage";
import { TodayMissionPage } from "./pages/TodayMissionPage";
import { DinoRoomPage } from "./pages/DinoRoomPage";
import { DinoCollectionPage } from "./pages/DinoCollectionPage";
import { DinoGrowthComparePage } from "./pages/DinoGrowthComparePage";
import { MyPageMainPage } from "./pages/MyPageMainPage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import { MyPageBillInputPage } from "./pages/MyPageBillInputPage";
import { MyPageTrendChartPage } from "./pages/MyPageTrendChartPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { RegionMapLeaderboardPage } from "./pages/RegionMapLeaderboardPage";
import { GuildManagementPage } from "./pages/GuildManagementPage";
import { WorldDungeonPage } from "./pages/WorldDungeonPage";
import { AdminCsvUploadPage } from "./pages/AdminCsvUploadPage";
import { AdminDungeonPage } from "./pages/AdminDungeonPage";
import { RegionEnergyDashboardPage } from "./pages/RegionEnergyDashboardPage";
import { RegionEnergyComparePage } from "./pages/RegionEnergyComparePage";

// 이전 버전(main branch)에 있던 부분. 필요 없을 시 밑의 Route 부분과 함께 지우시면 됩니다!
import { QuizTestPage } from "./pages/QuizTestPage";

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
      <Route path="/home" element={<HomePage />} />
      <Route path="/missions" element={<TodayMissionPage />} />
      <Route path="/dino-room" element={<DinoRoomPage />} />
      <Route path="/dino-collection" element={<DinoCollectionPage />} />
      <Route path="/dino-growth" element={<DinoGrowthComparePage />} />
      <Route path="/mypage" element={<MyPageMainPage />} />
      <Route path="/mypage/edit" element={<ProfileEditPage />} />
      <Route path="/mypage/bill" element={<MyPageBillInputPage />} />
      <Route path="/mypage/trend" element={<MyPageTrendChartPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/region-ranking" element={<RegionMapLeaderboardPage />} />
      <Route path="/guild" element={<GuildManagementPage />} />
      <Route path="/world-dungeon" element={<WorldDungeonPage />} />
      <Route path="/dashboard" element={<RegionEnergyDashboardPage />} />
      <Route path="/dashboard/compare" element={<RegionEnergyComparePage />} />
      <Route path="/admin/csv-upload" element={<AdminCsvUploadPage />} />
      <Route path="/admin/dungeon" element={<AdminDungeonPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
        
        
      // 이전 버전(main branch)에 있던 부분. 필요 없을 시 위의 import 부분과 함께 지우시면 됩니다!
      {/* 퀴즈 테스트 */}
      <Route path="/quiz" element={<QuizTestPage />} />
      
    </Routes>
  );
}

export default App;
