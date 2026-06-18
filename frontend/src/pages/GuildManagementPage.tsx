// src/pages/GuildManagementPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyGuild,
  getMyGuildMembers,
  getGuildRanking,
  type MyGuildResponse,
  type GuildMember,
  type GuildRankingItem,
} from "../api/guildApi";

import { GuildSeasonRewardModal } from "../components/guild/GuildSeasonRewardModal";

export function GuildManagementPage() {
  const navigate = useNavigate();

  const [isRewardOpen, setIsRewardOpen] = useState(false);

  // 내 길드 정보
  const [myGuild, setMyGuild] = useState<MyGuildResponse | null>(null);
  const [isMyGuildLoading, setIsMyGuildLoading] = useState(true);
  const [myGuildErrorMessage, setMyGuildErrorMessage] = useState("");

  // 길드 멤버 목록
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [membersErrorMessage, setMembersErrorMessage] = useState("");

  // 길드 랭킹
  const [guildRanking, setGuildRanking] = useState<GuildRankingItem[]>([]);
  const [isGuildRankingLoading, setIsGuildRankingLoading] = useState(true);
  const [guildRankingErrorMessage, setGuildRankingErrorMessage] = useState("");

  // 내 길드 정보 가져오기
  useEffect(() => {
    const fetchMyGuild = async () => {
      try {
        setIsMyGuildLoading(true);
        setMyGuildErrorMessage("");

        const data = await getMyGuild();
        setMyGuild(data);
      } catch (error) {
        console.error(error);
        setMyGuildErrorMessage("내 길드 정보를 불러오지 못했습니다.");
      } finally {
        setIsMyGuildLoading(false);
      }
    };

    fetchMyGuild();
  }, []);

  // 길드 멤버 목록 가져오기
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsMembersLoading(true);
        setMembersErrorMessage("");

        const data = await getMyGuildMembers();
        setMembers(data);
      } catch (error) {
        console.error(error);
        setMembersErrorMessage("길드 멤버 정보를 불러오지 못했습니다.");
      } finally {
        setIsMembersLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // 길드 랭킹 가져오기
  useEffect(() => {
    const fetchGuildRanking = async () => {
      try {
        setIsGuildRankingLoading(true);
        setGuildRankingErrorMessage("");

        const data = await getGuildRanking(0, 20);
        setGuildRanking(data);
      } catch (error) {
        console.error(error);
        setGuildRankingErrorMessage("길드 랭킹 정보를 불러오지 못했습니다.");
      } finally {
        setIsGuildRankingLoading(false);
      }
    };

    fetchGuildRanking();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">GUILD</p>

            <h1 className="mt-2 text-3xl font-bold">지역 길드</h1>

            <p className="mt-2 text-sm text-gray-600">
              같은 지역 사용자들이 함께 미션을 수행하고 길드 점수를 쌓는
              공간입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsRewardOpen(true)}
              className="rounded-2xl bg-[#E07A5F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c8654d]"
            >
              시즌 보상 확인
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              홈으로 가기
            </button>
          </div>
        </header>

        {/* 내 길드 정보 */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          {isMyGuildLoading && (
            <div className="rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
              내 길드 정보를 불러오는 중...
            </div>
          )}

          {!isMyGuildLoading && myGuildErrorMessage && (
            <div className="rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
              {myGuildErrorMessage}
            </div>
          )}

          {!isMyGuildLoading && !myGuildErrorMessage && myGuild && (
            <>
              <div className="flex items-center justify-between border-b-2 border-[#5F8C74] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏠</span>
                  <h2 className="text-2xl font-bold">{myGuild.name}</h2>
                </div>
                <span className="rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#5F8C74]">
                  지역코드: {myGuild.regionCode}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                전국 {myGuild.nationalRank}위 길드
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-[#FAF9F5] p-4">
                  <p className="text-sm text-gray-600">길드원</p>
                  <p className="mt-1 text-xl font-bold">
                    {myGuild.memberCount} / {myGuild.capacity}명
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF9F5] p-4">
                  <p className="text-sm text-gray-600">시즌 점수</p>
                  <p className="mt-1 text-xl font-bold text-[#5F8C74]">
                    {myGuild.seasonScore.toLocaleString()} P
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF9F5] p-4">
                  <p className="text-sm text-gray-600">내 기여 점수</p>
                  <p className="mt-1 text-xl font-bold text-[#E07A5F]">
                    {myGuild.myContribution} P
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF9F5] p-4">
                  <p className="text-sm text-gray-600">내 기여 순위</p>
                  <p className="mt-1 text-xl font-bold">
                    {myGuild.myContributionRank}위
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        {/* 길드 멤버 리스트 */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">GUILD MEMBERS</p>

          {isMembersLoading && (
            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
              길드 멤버 정보를 불러오는 중...
            </div>
          )}

          {!isMembersLoading && membersErrorMessage && (
            <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
              {membersErrorMessage}
            </div>
          )}

          {!isMembersLoading &&
            !membersErrorMessage &&
            members.length === 0 && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                아직 길드 멤버가 없습니다.
              </div>
            )}

          {!isMembersLoading && !membersErrorMessage && members.length > 0 && (
            <>
              <h2 className="mt-2 text-xl font-bold">
                길드 멤버 현황 ({members.length}명)
              </h2>

              <div className="mt-4 max-h-64 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {members.map((member, index) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-2xl bg-[#FAF9F5] p-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-500">
                          {index + 1}위
                        </span>
                        <span className="font-bold">
                          {member.role === "LEADER" && "👑 "}
                          {member.nickname}
                        </span>
                      </div>
                      <span className="font-bold text-[#5F8C74]">
                        시즌 누적: {member.seasonContribution} AP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* 길드 랭킹 */}
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">GUILD RANKING</p>

          <h2 className="mt-2 text-xl font-bold">길드 랭킹</h2>

          {isGuildRankingLoading && (
            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
              길드 랭킹 정보를 불러오는 중...
            </div>
          )}

          {!isGuildRankingLoading && guildRankingErrorMessage && (
            <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
              {guildRankingErrorMessage}
            </div>
          )}

          {!isGuildRankingLoading &&
            !guildRankingErrorMessage &&
            guildRanking.length === 0 && (
              <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm font-bold text-gray-500">
                아직 길드 랭킹 정보가 없습니다.
              </div>
            )}

          {!isGuildRankingLoading &&
            !guildRankingErrorMessage &&
            guildRanking.length > 0 && (
              <div className="mt-4 space-y-3">
                {guildRanking.map((guild) => (
                  <article
                    key={guild.guildId}
                    className={`flex flex-col gap-2 rounded-2xl p-4 md:flex-row md:items-center md:justify-between ${
                      myGuild?.guildId === guild.guildId
                        ? "bg-[#E8F2EC] ring-2 ring-[#5F8C74]"
                        : "bg-[#FAF9F5]"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-[#E07A5F]">
                        {guild.rank === 1 && "🥇 "}
                        {guild.rank === 2 && "🥈 "}
                        {guild.rank === 3 && "🥉 "}
                        {guild.rank}위
                      </p>

                      <h3 className="mt-1 font-bold">
                        {guild.name}
                        {myGuild?.guildId === guild.guildId && " (내 길드)"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {guild.regionName}
                      </p>
                    </div>

                    <div className="text-sm md:text-right">
                      <p className="font-bold">
                        {guild.seasonScore.toLocaleString()} P
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>
      </section>

      {isRewardOpen && myGuild && (
        <GuildSeasonRewardModal
          guildName={myGuild.name}
          rank={myGuild.nationalRank}
          rewardPoint={500}
          onClose={() => setIsRewardOpen(false)}
        />
      )}
    </main>
  );
}
