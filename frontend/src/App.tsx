// src/App.tsx

import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { TodayMissionPage } from "./pages/TodayMissionPage";
import { DinoRoomPage } from "./pages/DinoRoomPage";
import { QuizTestPage } from "./pages/QuizTestPage";

function App() {
  return (
    <Routes>
      {/* 처음 접속하면 /home으로 보내기 */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* 홈 화면 */}
      <Route path="/home" element={<HomePage />} />

      {/* 오늘의 미션 화면 */}
      <Route path="/missions" element={<TodayMissionPage />} />

      {/* 디노 룸 화면 */}
      <Route path="/dino-room" element={<DinoRoomPage />} />

      {/* 퀴즈 테스트 화면 */}
      <Route path="/quiz" element={<QuizTestPage />} />
    </Routes>
  );
}

export default App;
