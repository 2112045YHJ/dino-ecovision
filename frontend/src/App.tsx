<<<<<<< Updated upstream
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
=======
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
>>>>>>> Stashed changes

function App() {
  const [count, setCount] = useState(0)

  return (
<<<<<<< Updated upstream
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
=======
    <Routes>
      {/* 기본 진입점 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 인증 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 온보딩 */}
      <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
      <Route path="/onboarding/dino" element={<DinoSelectionPage />} />
      <Route
        path="/dino-selection"
        element={<Navigate to="/onboarding/dino" replace />}
      />

      {/* 메인 */}
      <Route path="/home" element={<HomePage />} />

      {/* 미션 */}
      <Route path="/missions" element={<TodayMissionPage />} />

      {/* 디노 */}
      <Route path="/dino-room" element={<DinoRoomPage />} />
      <Route path="/dino-collection" element={<DinoCollectionPage />} />

      {/* 마이페이지 */}
      <Route path="/mypage" element={<MyPageMainPage />} />
      <Route path="/mypage/edit" element={<ProfileEditPage />} />
      <Route path="/mypage/bill" element={<MyPageBillInputPage />} />
      <Route path="/mypage/trend" element={<MyPageTrendChartPage />} />

      {/* 랭킹 */}
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/region-ranking" element={<RegionMapLeaderboardPage />} />

      {/* 길드 */}
      <Route path="/guild" element={<GuildManagementPage />} />

      {/* 월드/던전 */}
      <Route path="/world-dungeon" element={<WorldDungeonPage />} />

      {/* 어드민 */}
      <Route path="/admin/csv-upload" element={<AdminCsvUploadPage />} />
      <Route path="/admin/dungeon" element={<AdminDungeonPage />} />

      {/* 없는 경로 → 로그인으로 (반드시 맨 마지막) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
>>>>>>> Stashed changes
}

export default App
