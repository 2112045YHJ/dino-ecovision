// src/components/mission/MissionCard.tsx

import type { Mission } from "../../types/mission";

interface MissionCardProps {
  mission: Mission;
  onCompleteClick: (mission: Mission) => void;
}

export function MissionCard({ mission, onCompleteClick }: MissionCardProps) {
  return (
    <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#5F8C74]">
            {mission.categoryLabel}
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#2C3531]">
            {mission.missionName}
          </h2>
        </div>

        <span className="rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#5F8C74]">
          +{mission.finalRewardPoint}P
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600">{mission.description}</p>

      <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
        <div className="flex justify-between">
          <span>기본 보상</span>
          <span>{mission.baseReward}P</span>
        </div>

        <div className="mt-1 flex justify-between">
          <span>탄소 가중치</span>
          <span>x {mission.carbonWeight}</span>
        </div>

        <div className="mt-1 flex justify-between">
          <span>예상 절감량</span>
          <span>{mission.estimatedReductionKg} kgCO₂</span>
        </div>

        <div className="mt-2 flex justify-between font-bold text-[#E07A5F]">
          <span>최종 보상</span>
          <span>+{mission.finalRewardPoint}P</span>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
        onClick={() => onCompleteClick(mission)}
      >
        완료 인증하기
      </button>
    </article>
  );
}
