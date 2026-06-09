// src/App.tsx

import { Navigate, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { TodayMissionPage } from "./pages/TodayMissionPage";
import { DinoRoomPage } from "./pages/DinoRoomPage";
import { QuizTestPage } from "./pages/QuizTestPage";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingProfilePage } from "./pages/OnboardingProfilePage";
import { DinoSelectionPage } from "./pages/DinoSelectionPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
      <Route path="/onboarding/dino" element={<DinoSelectionPage />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/missions" element={<TodayMissionPage />} />
      <Route path="/dino-room" element={<DinoRoomPage />} />
      <Route path="/quiz" element={<QuizTestPage />} />
    </Routes>
  );
}

export default App;
