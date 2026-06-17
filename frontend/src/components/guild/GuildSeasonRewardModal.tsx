// src/components/guild/GuildSeasonRewardModal.tsx

import { useState } from "react";

type Props = {
  guildName: string;
  rank: number;
  rewardPoint: number;
  onClose: () => void;
};

export function GuildSeasonRewardModal({
  guildName,
  rank,
  rewardPoint,
  onClose,
}: Props) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  const getRankLabel = (rank: number) => {
    if (rank === 1) return "🥇 1위 금메달";
    if (rank === 2) return "🥈 2위 은메달";
    if (rank === 3) return "🥉 3위 동메달";
    return `${rank}위`;
  };

  const getRankBadgeLabel = (rank: number) => {
    if (rank === 1) return "금메달 프로필 배지 해제";
    if (rank === 2) return "은메달 프로필 배지 해제";
    if (rank === 3) return "동메달 프로필 배지 해제";
    return "시즌 참여 배지 해제";
  };

  const handleClaim = async () => {
    try {
      setIsClaiming(true);

      // TODO: 실제 보상 수령 API 연결 시 교체하세요.
      // await claimSeasonReward();

      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsClaimed(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        {/* 트로피 아이콘 */}
        <div className="text-center text-6xl">🏆</div>

        {/* 타이틀 */}
        <h2 className="mt-4 text-center text-xl font-bold text-[#5F8C74]">
          시즌 랭킹 보상 도달!
        </h2>

        {/* 길드 및 순위 안내 */}
        <p className="mt-3 text-center text-sm leading-relaxed text-[#2C3531]">
          축하합니다! 소속 길드 <strong>[{guildName}]</strong>이 이번 시즌 전국{" "}
          <strong>{rank}위</strong>를 달성했습니다!
        </p>

        {/* 보상 상세 */}
        <div className="mt-5 rounded-2xl bg-[#FAF9F5] p-4">
          <p className="text-xs font-bold text-gray-500">지급 보상 상세</p>

          <p className="mt-3 text-sm font-bold text-[#5F8C74]">
            {getRankLabel(rank)} {getRankBadgeLabel(rank)}
          </p>

          <p className="mt-2 text-sm font-bold text-[#E07A5F]">
            💰 개인 기여 보상: +{rewardPoint} 클린 에너지
          </p>
        </div>

        {/* 수령 완료 후 안내 */}
        {isClaimed && (
          <div className="mt-4 rounded-2xl bg-[#E8F2EC] p-3 text-center text-sm font-bold text-[#5F8C74]">
            보상이 정상적으로 지급되었습니다!
          </div>
        )}

        {/* 버튼 */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-300 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            닫기
          </button>

          <button
            type="button"
            onClick={isClaimed ? onClose : handleClaim}
            disabled={isClaiming}
            className="flex-1 rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
          >
            {isClaiming ? "처리 중..." : isClaimed ? "확인" : "보상 수령 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
