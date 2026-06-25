// src/components/mission/MissionCompleteConfirmModal.tsx

type Props = {
  category: string;
  timeSlot: string;
  title: string;
  description: string;
  baseReward: number;
  carbonWeight: number;
  carbonWeightLabel: string;
  dungeonMultiplier?: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export function MissionCompleteConfirmModal({
  category,
  timeSlot,
  title,
  description,
  baseReward,
  carbonWeight,
  carbonWeightLabel,
  dungeonMultiplier = 1,
  onCancel,
  onConfirm,
}: Props) {
  // 던전 미션이면 배율(×2 등)이 1보다 큽니다. 일반 미션은 1.
  const hasDungeonBonus = dungeonMultiplier > 1;
  const finalReward = Math.round(
    baseReward * carbonWeight * dungeonMultiplier,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        {/* 배지 */}
        <div className="flex gap-2">
          <span className="rounded-full bg-[#FAF9F5] px-3 py-1 text-xs font-medium text-gray-600">
            {category}
          </span>
          <span className="rounded-full bg-[#FAF9F5] px-3 py-1 text-xs font-medium text-gray-600">
            {timeSlot}
          </span>
        </div>

        {/* 타이틀 */}
        <h2 className="mt-3 text-lg font-bold text-[#2C3531]">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{description}</p>

        {/* 보상 계산 */}
        <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4">
          <p className="text-xs font-bold text-gray-500">보상 계산</p>

          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>기본 보상</span>
            <span>{baseReward}</span>
          </div>

          <div className="mt-1 flex justify-between text-sm text-gray-600">
            <span>탄소 가중치 ({carbonWeightLabel})</span>
            <span>× {carbonWeight}</span>
          </div>

          {hasDungeonBonus && (
            <div className="mt-1 flex justify-between text-sm font-bold text-[#E07A5F]">
              <span>🔥 던전 보상 배율</span>
              <span>× {dungeonMultiplier}</span>
            </div>
          )}

          <div className="my-2 border-t border-[#E8F2EC]" />

          <div className="flex justify-between text-sm font-bold">
            <span>최종 보상</span>
            <span className="text-[#E07A5F]">+{finalReward}</span>
          </div>
        </div>

        {/* 안내 */}
        <p className="mt-3 text-xs text-gray-500">
          자가 신고 미션입니다. 정직하게 체크해주세요.
        </p>

        {/* 버튼 */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-gray-300 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-[#E07A5F] py-3 text-sm font-bold text-white transition hover:bg-[#c8654d]"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
