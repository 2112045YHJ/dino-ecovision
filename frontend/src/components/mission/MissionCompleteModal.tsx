// src/components/mission/MissionCompleteModal.tsx

import type { Mission } from "../../types/mission";

interface MissionCompleteModalProps {
  mission: Mission;
  onClose: () => void;
  onConfirm: () => void;
}

export function MissionCompleteModal({
  mission,
  onClose,
  onConfirm,
}: MissionCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <p className="text-sm font-bold text-[#5F8C74]">MISSION COMPLETE</p>

        <h2 className="mt-2 text-xl font-bold text-[#2C3531]">
          {mission.missionName}
        </h2>

        <p className="mt-2 text-sm text-gray-600">{mission.proofGuideText}</p>

        <div className="mt-5 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
          <div className="flex justify-between">
            <span>기본 보상</span>
            <span>{mission.baseReward}P</span>
          </div>

          <div className="mt-1 flex justify-between">
            <span>탄소 가중치</span>
            <span>x {mission.carbonWeight}</span>
          </div>

          <div className="mt-1 flex justify-between">
            <span>예상 탄소 절감량</span>
            <span>{mission.estimatedReductionKg} kgCO₂</span>
          </div>

          <div className="mt-3 border-t border-[#E8F2EC] pt-3">
            <div className="flex justify-between text-base font-bold text-[#E07A5F]">
              <span>획득 예정 보상</span>
              <span>+{mission.finalRewardPoint}P</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-2xl border border-[#E8F2EC] py-3 font-bold text-gray-600"
            onClick={onClose}
          >
            취소
          </button>

          <button
            type="button"
            className="flex-1 rounded-2xl bg-[#E07A5F] py-3 font-bold text-white transition hover:bg-[#c8654d]"
            onClick={onConfirm}
          >
            완료하기
          </button>
        </div>
      </div>
    </div>
  );
}
