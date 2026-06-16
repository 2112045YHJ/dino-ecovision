// src/components/mission/MissionCompleteModal.tsx

import type { Mission } from "../../types/mission";

interface MissionCompleteModalProps {
  mission: Mission;
  onClose: () => void;
  onConfirm: () => void;
}

// 백엔드 category 값을 화면용 한글로 바꿔주는 함수입니다.
function getCategoryLabel(category: string) {
  const categoryMap: Record<string, string> = {
    COOLING: "냉방",
    HEATING: "난방",
    LIGHTING: "조명",
    STANDBY: "대기전력",
    KITCHEN: "주방",
    RECYCLING: "자원순환",
    WATER: "물 절약",
    ETC: "기타",
  };

  return categoryMap[category] ?? category;
}

// 백엔드 slot 값을 화면용 한글로 바꿔주는 함수입니다.
function getSlotLabel(slot: string) {
  const slotMap: Record<string, string> = {
    DAY: "낮 미션",
    EVENING: "저녁 미션",
    ANYTIME: "언제든 가능",
  };

  return slotMap[slot] ?? slot;
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
          {mission.title}
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          이 미션을 완료 처리할까요? 완료하면 포인트와 공룡 EXP가 반영됩니다.
        </p>

        <div className="mt-5 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
          <div className="flex justify-between">
            <span>카테고리</span>
            <span>{getCategoryLabel(mission.category)}</span>
          </div>

          <div className="mt-1 flex justify-between">
            <span>미션 시간대</span>
            <span>{getSlotLabel(mission.slot)}</span>
          </div>

          <div className="mt-1 flex justify-between">
            <span>기본 보상</span>
            <span>{mission.baseReward}P</span>
          </div>

          <div className="mt-1 flex justify-between">
            <span>예상 탄소 절감량</span>
            <span>{mission.estimatedCo2Kg} kgCO₂</span>
          </div>

          <div className="mt-3 border-t border-[#E8F2EC] pt-3">
            <div className="flex justify-between text-base font-bold text-[#E07A5F]">
              <span>완료 시 기본 보상</span>
              <span>+{mission.baseReward}P</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          실제 최종 보상은 완료 시점의 탄소 가중치와 일일 상한에 따라 달라질 수
          있습니다.
        </p>

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
