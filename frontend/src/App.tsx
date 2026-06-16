// src/App.tsx

import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { OnboardingProfilePage } from "./pages/OnboardingProfilePage";
import { DinoSelectionPage } from "./pages/DinoSelectionPage";
import { HomePage } from "./pages/HomePage";
import { TodayMissionPage } from "./pages/TodayMissionPage";
import { DinoRoomPage } from "./pages/DinoRoomPage";
import { DinoCollectionPage } from "./pages/DinoCollectionPage";
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
      <Route path="/onboarding/dino" element={<DinoSelectionPage />} />
      <Route
        path="/dino-selection"
        element={<Navigate to="/onboarding/dino" replace />}
      />
      <Route path="/home" element={<HomePage />} />
      <Route path="/missions" element={<TodayMissionPage />} />
      <Route path="/dino-room" element={<DinoRoomPage />} />
      <Route path="/dino-collection" element={<DinoCollectionPage />} />
      <Route path="/mypage" element={<MyPageMainPage />} />
      <Route path="/mypage/edit" element={<ProfileEditPage />} />
      <Route path="/mypage/bill" element={<MyPageBillInputPage />} />
      <Route path="/mypage/trend" element={<MyPageTrendChartPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/region-ranking" element={<RegionMapLeaderboardPage />} />
      <Route path="/guild" element={<GuildManagementPage />} />
      <Route path="/world-dungeon" element={<WorldDungeonPage />} />
      <Route path="/admin/csv-upload" element={<AdminCsvUploadPage />} />
      <Route path="/admin/dungeon" element={<AdminDungeonPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
