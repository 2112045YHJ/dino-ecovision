// src/pages/LeaderboardPage.tsx

<<<<<<< HEAD
import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { userRankingMock } from "../mocks/rankingMock";
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPersonalRanking,
  getRegionMapRanking,
  type PersonalRankingResponse,
  type RegionMapRankingResponse,
} from "../api/rankingApi";

import { getGuildRanking, type GuildRankingItem } from "../api/guildApi";

type TabType = "personal" | "guild" | "region";
>>>>>>> feature/community-fe-setup

export function LeaderboardPage() {
  const navigate = useNavigate();

<<<<<<< HEAD
  const topUser = userRankingMock[0];
  const totalReducedCarbon = userRankingMock.reduce(
    (sum, user) => sum + user.reducedCarbonKg,
    0,
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">LEADERBOARD</p>

          <h1 className="mt-1 text-3xl font-bold text-[#2C3531]">에코 랭킹</h1>

          <p className="mt-1 text-sm text-gray-600">
            미션 참여 점수와 예상 탄소 절감량을 기준으로 사용자 순위를 확인할 수
            있어요.
          </p>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              TOP USER
            </p>

            <h2 className="mt-2 text-2xl font-bold">{topUser.nickname}</h2>

            <p className="mt-1 text-sm text-gray-500">{topUser.regionName}</p>

            <p className="mt-3 rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#5F8C74]">
              {topUser.level}
            </p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              HIGHEST POINT
            </p>

            <h2 className="mt-2 text-2xl font-bold">{topUser.point} P</h2>

            <p className="mt-1 text-sm text-gray-500">
              미션 완료와 퀴즈 보상 기준
            </p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              TOTAL REDUCTION
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {totalReducedCarbon.toFixed(1)} kg
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              랭킹 사용자 예상 절감량 합계
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-[#E8F2EC] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
                USER RANKING
              </p>

              <h2 className="mt-1 text-xl font-bold">개인 랭킹 TOP 5</h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/region-ranking")}
              className="rounded-2xl border border-[#5F8C74] px-4 py-2 text-xs font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              지역 랭킹 보기
            </button>
          </div>

          <div className="space-y-3">
            {userRankingMock.map((user) => (
              <article
                key={user.rank}
                className="flex flex-col gap-3 rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${
                      user.rank === 1
                        ? "bg-[#E07A5F] text-white"
                        : "bg-[#E8F2EC] text-[#5F8C74]"
                    }`}
                  >
                    {user.rank}
                  </div>

                  <div>
                    <h3 className="font-bold">{user.nickname}</h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {user.regionName} · {user.level}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-right text-xs md:min-w-[300px]">
                  <div>
                    <p className="text-gray-500">포인트</p>
                    <p className="mt-1 font-bold text-[#5F8C74]">
                      {user.point} P
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">절감량</p>
                    <p className="mt-1 font-bold">{user.reducedCarbonKg} kg</p>
                  </div>

                  <div>
                    <p className="text-gray-500">미션</p>
                    <p className="mt-1 font-bold">
                      {user.completedMissionCount}개
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/guild")}
            className="rounded-3xl border border-[#E8F2EC] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              GUILD
            </p>
            <h2 className="mt-2 text-lg font-bold">지역 길드 보기</h2>
            <p className="mt-2 text-sm text-gray-600">
              같은 지역 사용자들의 길드 점수와 기여도를 확인해요.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/world-dungeon")}
            className="rounded-3xl border border-[#E8F2EC] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              WORLD DUNGEON
            </p>
            <h2 className="mt-2 text-lg font-bold">월드/던전 상태 보기</h2>
            <p className="mt-2 text-sm text-gray-600">
              전력 예비율과 던전 이벤트 상태를 확인해요.
            </p>
          </button>
        </section>

        <p className="mt-4 rounded-2xl bg-white p-4 text-xs text-gray-500 shadow-sm">
          현재는 API 연결 전 더미데이터 화면입니다. 나중에 랭킹 API가 준비되면
          `rankingMock` 부분만 API 호출로 교체하면 됩니다.
        </p>
      </main>
    </div>
=======
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  // 개인 랭킹 상태
  const [personalRanking, setPersonalRanking] =
    useState<PersonalRankingResponse | null>(null);
  const [isPersonalLoading, setIsPersonalLoading] = useState(true);
  const [personalErrorMessage, setPersonalErrorMessage] = useState("");

  // 길드 랭킹 상태
  const [guildRanking, setGuildRanking] = useState<GuildRankingItem[]>([]);
  const [isGuildLoading, setIsGuildLoading] = useState(true);
  const [guildErrorMessage, setGuildErrorMessage] = useState("");

  // 지역 랭킹 상태
  const [regionRanking, setRegionRanking] =
    useState<RegionMapRankingResponse | null>(null);
  const [isRegionLoading, setIsRegionLoading] = useState(true);
  const [regionErrorMessage, setRegionErrorMessage] = useState("");

  // 개인 랭킹 가져오기
  useEffect(() => {
    const fetchPersonalRanking = async () => {
      try {
        setIsPersonalLoading(true);
        setPersonalErrorMessage("");

        const data = await getPersonalRanking("national", 0, 20);
        setPersonalRanking(data);
      } catch (error) {
        console.error(error);
        setPersonalErrorMessage("개인 랭킹 정보를 불러오지 못했습니다.");
      } finally {
        setIsPersonalLoading(false);
      }
    };

    fetchPersonalRanking();
  }, []);

  // 길드 랭킹 가져오기
  useEffect(() => {
    const fetchGuildRanking = async () => {
      try {
        setIsGuildLoading(true);
        setGuildErrorMessage("");

        const data = await getGuildRanking(0, 20);
        setGuildRanking(data);
      } catch (error) {
        console.error(error);
        setGuildErrorMessage("길드 랭킹 정보를 불러오지 못했습니다.");
      } finally {
        setIsGuildLoading(false);
      }
    };

    fetchGuildRanking();
  }, []);

  // 지역 랭킹 가져오기
  useEffect(() => {
    const fetchRegionRanking = async () => {
      try {
        setIsRegionLoading(true);
        setRegionErrorMessage("");

        const data = await getRegionMapRanking("national");
        setRegionRanking(data);
      } catch (error) {
        console.error(error);
        setRegionErrorMessage("지역 랭킹 정보를 불러오지 못했습니다.");
      } finally {
        setIsRegionLoading(false);
      }
    };

    fetchRegionRanking();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">LEADERBOARD</p>

            <h1 className="mt-2 text-3xl font-bold">통합 랭킹 보드</h1>

            <p className="mt-2 text-sm text-gray-600">
              개인, 길드, 지역 단위로 친환경 활동 순위를 확인하세요.
              {personalRanking?.seasonName && (
                <span className="ml-2 text-[#5F8C74] font-bold">
                  ({personalRanking.seasonName})
                </span>
              )}
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
            {isPersonalLoading && (
              <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
                개인 랭킹 정보를 불러오는 중...
              </div>
            )}

            {!isPersonalLoading && personalErrorMessage && (
              <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
                {personalErrorMessage}
              </div>
            )}

            {!isPersonalLoading &&
              !personalErrorMessage &&
              personalRanking &&
              personalRanking.rankings.length === 0 && (
                <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
                  아직 랭킹 정보가 없습니다.
                </div>
              )}

            {!isPersonalLoading &&
              !personalErrorMessage &&
              personalRanking &&
              personalRanking.rankings.length > 0 && (
                <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <div className="grid grid-cols-[70px_1fr_1fr_100px] gap-2 bg-[#E8F2EC] px-5 py-3 text-sm font-bold text-[#2C3531]">
                    <span>순위</span>
                    <span>닉네임</span>
                    <span>지역</span>
                    <span className="text-right">포인트</span>
                  </div>

                  {personalRanking.rankings.map((user) => {
                    const isFirst = user.rank === 1;
                    const isTop3 = user.rank <= 3;

                    return (
                      <div
                        key={user.rank}
                        className={`grid grid-cols-[70px_1fr_1fr_100px] gap-2 border-t border-gray-100 px-5 py-4 text-sm ${
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
                        <span className="text-gray-600">
                          {user.regionName ?? "-"}
                        </span>
                        <span className="text-right font-bold">
                          {user.rankingPoint} P
                        </span>
                      </div>
                    );
                  })}
                </section>
              )}
          </>
        )}

        {/* 길드 랭킹 */}
        {activeTab === "guild" && (
          <>
            {isGuildLoading && (
              <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
                길드 랭킹 정보를 불러오는 중...
              </div>
            )}

            {!isGuildLoading && guildErrorMessage && (
              <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
                {guildErrorMessage}
              </div>
            )}

            {!isGuildLoading &&
              !guildErrorMessage &&
              guildRanking.length === 0 && (
                <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
                  아직 길드 랭킹 정보가 없습니다.
                </div>
              )}

            {!isGuildLoading &&
              !guildErrorMessage &&
              guildRanking.length > 0 && (
                <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <div className="grid grid-cols-[70px_1fr_1fr_120px] gap-2 bg-[#E8F2EC] px-5 py-3 text-sm font-bold text-[#2C3531]">
                    <span>순위</span>
                    <span>길드명</span>
                    <span>지역</span>
                    <span className="text-right">길드 점수</span>
                  </div>

                  {guildRanking.map((guild) => {
                    const isFirst = guild.rank === 1;
                    const isTop3 = guild.rank <= 3;

                    return (
                      <div
                        key={guild.guildId}
                        className={`grid grid-cols-[70px_1fr_1fr_120px] gap-2 border-t border-gray-100 px-5 py-4 text-sm ${
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
                        <span className="font-bold">{guild.name}</span>
                        <span className="text-gray-600">
                          {guild.regionName}
                        </span>
                        <span className="text-right font-bold">
                          {guild.seasonScore.toLocaleString()} AP
                        </span>
                      </div>
                    );
                  })}
                </section>
              )}
          </>
        )}

        {/* 지역 랭킹 */}
        {activeTab === "region" && (
          <>
            {isRegionLoading && (
              <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
                지역 랭킹 정보를 불러오는 중...
              </div>
            )}

            {!isRegionLoading && regionErrorMessage && (
              <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
                {regionErrorMessage}
              </div>
            )}

            {!isRegionLoading &&
              !regionErrorMessage &&
              regionRanking &&
              regionRanking.topRegions.length === 0 && (
                <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
                  아직 지역 랭킹 정보가 없습니다.
                </div>
              )}

            {!isRegionLoading &&
              !regionErrorMessage &&
              regionRanking &&
              regionRanking.topRegions.length > 0 && (
                <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <div className="grid grid-cols-[70px_1fr_150px] gap-2 bg-[#E8F2EC] px-5 py-3 text-sm font-bold text-[#2C3531]">
                    <span>순위</span>
                    <span>지역명</span>
                    <span className="text-right">절감 탄소량</span>
                  </div>

                  {regionRanking.topRegions.map((region) => {
                    const isFirst = region.rank === 1;
                    const isTop3 = region.rank <= 3;

                    return (
                      <div
                        key={region.rank}
                        className={`grid grid-cols-[70px_1fr_150px] gap-2 border-t border-gray-100 px-5 py-4 text-sm ${
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
                        <span className="text-right font-bold">
                          {region.savedCarbonKg.toFixed(2)} kg
                        </span>
                      </div>
                    );
                  })}
                </section>
              )}
          </>
        )}

        {/* 내 랭킹 고정 바 (개인 랭킹 데이터에서 가져옴) */}
        {personalRanking?.myRank && (
          <section className="mt-5 rounded-3xl bg-[#E8F2EC] p-5 shadow-sm ring-2 ring-[#5F8C74]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#5F8C74]">MY RANKING</p>
                {personalRanking.myRank.rank !== null ? (
                  <p className="mt-1 text-sm font-bold text-[#2C3531]">
                    내 시즌 랭킹: {personalRanking.myRank.rank}위{" "}
                    {personalRanking.myRank.percentile !== null && (
                      <span className="text-xs text-gray-500">
                        (상위 {personalRanking.myRank.percentile}%)
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-bold text-[#2C3531]">
                    아직 랭킹에 진입하지 않았습니다.
                  </p>
                )}
              </div>

              <p className="text-lg font-bold text-[#E07A5F]">
                누적 {personalRanking.myRank.rankingPoint} AP
              </p>
            </div>
          </section>
        )}
      </section>
    </main>
>>>>>>> feature/community-fe-setup
  );
}
