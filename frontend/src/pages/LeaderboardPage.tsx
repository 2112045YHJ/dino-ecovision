// src/pages/LeaderboardPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { userRankingMock } from "../mocks/rankingMock";

type TabType = "personal" | "guild" | "region";

// 길드 랭킹 더미 데이터
const guildRankingMock = [
  { rank: 1, guildName: "해운대 에코가드", point: 14250, members: 14 },
  { rank: 2, guildName: "강남 그린팀", point: 13800, members: 18 },
  { rank: 3, guildName: "송도 에코빌", point: 12950, members: 12 },
  { rank: 4, guildName: "수영 친환경", point: 11700, members: 15 },
  { rank: 5, guildName: "마포 그린리프", point: 10850, members: 16 },
];

// 지역 랭킹 더미 데이터
const regionRankingMock = [
  { rank: 1, regionName: "부산 해운대구 우동", point: 28450, members: 142 },
  { rank: 2, regionName: "서울 강남구 역삼동", point: 26800, members: 138 },
  { rank: 3, regionName: "인천 송도동", point: 24500, members: 125 },
  { rank: 4, regionName: "부산 수영구 광안동", point: 22300, members: 118 },
  { rank: 5, regionName: "서울 마포구 망원동", point: 20100, members: 108 },
];

// 내 랭킹 더미 데이터
const myRanking = {
  personalRank: 184,
  personalPercent: 15,
  personalPoint: 340,
  guildRank: 5,
  regionRank: 1,
};

export function LeaderboardPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("personal");

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">LEADERBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">통합 랭킹 보드</h1>

            <p className="mt-2 text-sm text-gray-600">
              개인, 길드, 지역 단위로 친환경 활동 순위를 확인하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            홈으로 가기
          </button>
        </header>

        {/* 탭 메뉴 */}
        <section className="mb-5 rounded-3xl bg-white p-2 shadow-sm">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex-1 rounded-2xl py-3 text-sm font-bold transition ${
                activeTab === "personal"
                  ? "bg-[#5F8C74] text-white"
                  : "bg-transparent text-gray-500 hover:bg-[#E8F2EC]"
              }`}
            >
              개인 랭킹
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guild")}
              className={`flex-1 rounded-2xl py-3 text-sm font-bold transition ${
                activeTab === "guild"
                  ? "bg-[#5F8C74] text-white"
                  : "bg-transparent text-gray-500 hover:bg-[#E8F2EC]"
              }`}
            >
              길드 랭킹
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("region")}
              className={`flex-1 rounded-2xl py-3 text-sm font-bold transition ${
                activeTab === "region"
                  ? "bg-[#5F8C74] text-white"
                  : "bg-transparent text-gray-500 hover:bg-[#E8F2EC]"
              }`}
            >
              지역(동네) 랭킹
            </button>
          </div>
        </section>

        {/* 개인 랭킹 */}
        {activeTab === "personal" && (
          <>
            <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="grid grid-cols-[70px_1fr_1fr_100px_120px] gap-2 bg-[#E8F2EC] px-5 py-3 text-sm font-bold text-[#2C3531]">
                <span>순위</span>
                <span>닉네임</span>
                <span>지역</span>
                <span className="text-right">포인트</span>
                <span className="text-right">절감량</span>
              </div>

              {userRankingMock.map((user) => {
                const isFirst = user.rank === 1;
                const isTop3 = user.rank <= 3;

                return (
                  <div
                    key={user.rank}
                    className={`grid grid-cols-[70px_1fr_1fr_100px_120px] gap-2 border-t border-gray-100 px-5 py-4 text-sm ${
                      isFirst
                        ? "bg-[#FFF8E8]"
                        : isTop3
                          ? "bg-[#FAF9F5]"
                          : "bg-white"
                    }`}
                  >
                    <span className="font-bold text-[#E07A5F]">
                      {user.rank === 1 && "🥇 "}
                      {user.rank === 2 && "🥈 "}
                      {user.rank === 3 && "🥉 "}
                      {user.rank}위
                    </span>
                    <span className="font-bold">{user.nickname}</span>
                    <span className="text-gray-600">{user.regionName}</span>
                    <span className="text-right font-bold">{user.point} P</span>
                    <span className="text-right text-gray-600">
                      {user.reducedCarbonKg} kg
                    </span>
                  </div>
                );
              })}
            </section>
          </>
        )}

        {/* 길드 랭킹 */}
        {activeTab === "guild" && (
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="grid grid-cols-[70px_1fr_120px_120px] gap-2 bg-[#E8F2EC] px-5 py-3 text-sm font-bold text-[#2C3531]">
              <span>순위</span>
              <span>길드명</span>
              <span className="text-right">멤버</span>
              <span className="text-right">길드 점수</span>
            </div>

            {guildRankingMock.map((guild) => {
              const isFirst = guild.rank === 1;
              const isTop3 = guild.rank <= 3;

              return (
                <div
                  key={guild.rank}
                  className={`grid grid-cols-[70px_1fr_120px_120px] gap-2 border-t border-gray-100 px-5 py-4 text-sm ${
                    isFirst
                      ? "bg-[#FFF8E8]"
                      : isTop3
                        ? "bg-[#FAF9F5]"
                        : "bg-white"
                  }`}
                >
                  <span className="font-bold text-[#E07A5F]">
                    {guild.rank === 1 && "🥇 "}
                    {guild.rank === 2 && "🥈 "}
                    {guild.rank === 3 && "🥉 "}
                    {guild.rank}위
                  </span>
                  <span className="font-bold">{guild.guildName}</span>
                  <span className="text-right text-gray-600">
                    {guild.members}명
                  </span>
                  <span className="text-right font-bold">
                    {guild.point.toLocaleString()} AP
                  </span>
                </div>
              );
            })}
          </section>
        )}

        {/* 지역 랭킹 */}
        {activeTab === "region" && (
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="grid grid-cols-[70px_1fr_120px_120px] gap-2 bg-[#E8F2EC] px-5 py-3 text-sm font-bold text-[#2C3531]">
              <span>순위</span>
              <span>지역명</span>
              <span className="text-right">참여자</span>
              <span className="text-right">지역 점수</span>
            </div>

            {regionRankingMock.map((region) => {
              const isFirst = region.rank === 1;
              const isTop3 = region.rank <= 3;

              return (
                <div
                  key={region.rank}
                  className={`grid grid-cols-[70px_1fr_120px_120px] gap-2 border-t border-gray-100 px-5 py-4 text-sm ${
                    isFirst
                      ? "bg-[#FFF8E8]"
                      : isTop3
                        ? "bg-[#FAF9F5]"
                        : "bg-white"
                  }`}
                >
                  <span className="font-bold text-[#E07A5F]">
                    {region.rank === 1 && "🥇 "}
                    {region.rank === 2 && "🥈 "}
                    {region.rank === 3 && "🥉 "}
                    {region.rank}위
                  </span>
                  <span className="font-bold">{region.regionName}</span>
                  <span className="text-right text-gray-600">
                    {region.members}명
                  </span>
                  <span className="text-right font-bold">
                    {region.point.toLocaleString()} AP
                  </span>
                </div>
              );
            })}
          </section>
        )}

        {/* 내 랭킹 고정 바 */}
        <section className="mt-5 rounded-3xl bg-[#E8F2EC] p-5 shadow-sm ring-2 ring-[#5F8C74]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#5F8C74]">MY RANKING</p>
              {activeTab === "personal" && (
                <p className="mt-1 text-sm font-bold text-[#2C3531]">
                  내 시즌 랭킹: {myRanking.personalRank}위{" "}
                  <span className="text-xs text-gray-500">
                    (상위 {myRanking.personalPercent}%)
                  </span>
                </p>
              )}
              {activeTab === "guild" && (
                <p className="mt-1 text-sm font-bold text-[#2C3531]">
                  내 길드 기여 순위: {myRanking.guildRank}위
                </p>
              )}
              {activeTab === "region" && (
                <p className="mt-1 text-sm font-bold text-[#2C3531]">
                  내 지역: 부산 해운대구 우동 ({myRanking.regionRank}위)
                </p>
              )}
            </div>

            <p className="text-lg font-bold text-[#E07A5F]">
              누적 {myRanking.personalPoint} AP
            </p>
          </div>
        </section>

        <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm">
          현재는 더미데이터 기준 화면입니다. 나중에 랭킹 API가 연결되면 이
          영역을 실제 사용자 랭킹으로 교체하면 됩니다.
        </p>
      </section>
    </main>
  );
}
