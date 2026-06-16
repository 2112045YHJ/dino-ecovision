// src/components/mission/MissionCard.tsx

import type { Mission } from "../../types/mission";

interface MissionCardProps {
  mission: Mission;
  onCompleteClick: (mission: Mission) => void;
}

// 백엔드 category 값을 화면용 한글로 바꿔주는 함수입니다.
// 예: "KITCHEN" → "주방"
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
// 예: "ANYTIME" → "언제든 가능"
function getSlotLabel(slot: string) {
  const slotMap: Record<string, string> = {
    DAY: "낮 미션",
    EVENING: "저녁 미션",
    ANYTIME: "언제든 가능",
  };

  return slotMap[slot] ?? slot;
}

export function MissionCard({ mission, onCompleteClick }: MissionCardProps) {
  return (
    <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#5F8C74]">
            {getCategoryLabel(mission.category)} · {getSlotLabel(mission.slot)}
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#2C3531]">
            {mission.title}
          </h2>
        </div>

        <span className="rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#5F8C74]">
          +{mission.baseReward}P
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        오늘 실천할 수 있는 탄소 절감 미션입니다.
      </p>

      <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4 text-sm">
        <div className="flex justify-between">
          <span>기본 보상</span>
          <span>{mission.baseReward}P</span>
        </div>

        <div className="mt-1 flex justify-between">
          <span>예상 절감량</span>
          <span>{mission.estimatedCo2Kg} kgCO₂</span>
        </div>

        <div className="mt-1 flex justify-between">
          <span>미션 시간대</span>
          <span>{getSlotLabel(mission.slot)}</span>
        </div>

        <div className="mt-2 flex justify-between font-bold text-[#E07A5F]">
          <span>완료 시 기본 보상</span>
          <span>+{mission.baseReward}P</span>
        </div>
      </div>

      <button
        type="button"
        disabled={mission.completed}
        className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
        onClick={() => onCompleteClick(mission)}
      >
        {mission.completed ? "완료된 미션" : "완료 인증하기"}
      </button>
    </article>
  );
}
