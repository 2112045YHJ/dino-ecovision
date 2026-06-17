// src/components/dino/DinoEvolutionModal.tsx

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../../assets/images/dinos/dinoImages";

type Props = {
  nickname: string;
  dinoType: DinoType;
  prevStage: DinoStage;
  newStage: DinoStage;
  onClose: () => void;
};

const stageLabels: Record<DinoStage, string> = {
  EGG: "알",
  HATCHLING: "유아기",
  JUVENILE: "청소년기",
  ADULT: "성룡",
};

export function DinoEvolutionModal({
  nickname,
  dinoType,
  prevStage,
  newStage,
  onClose,
}: Props) {
  const prevImage = dinoImagesByType[dinoType][prevStage];
  const newImage = dinoImagesByType[dinoType][newStage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl text-center">
        {/* 축하 타이틀 */}
        <p className="text-sm font-bold text-[#5F8C74]">CONGRATULATIONS!</p>

        <h2 className="mt-2 text-xl font-bold text-[#2C3531]">
          공룡이 새로운 모습으로 진화했습니다!
        </h2>

        {/* 진화 전 → 후 이미지 */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#FAF9F5]">
              <img
                src={prevImage}
                alt={`이전 단계 ${stageLabels[prevStage]}`}
                className="h-16 object-contain opacity-60"
              />
            </div>
            <p className="text-xs text-gray-500">{stageLabels[prevStage]}</p>
          </div>

          <span className="text-2xl">→</span>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#E8F2EC] ring-2 ring-[#5F8C74]">
              <img
                src={newImage}
                alt={`새로운 단계 ${stageLabels[newStage]}`}
                className="h-16 object-contain"
              />
            </div>
            <p className="text-xs font-bold text-[#5F8C74]">
              {stageLabels[newStage]}
            </p>
          </div>
        </div>

        {/* 닉네임 안내 */}
        <div className="mt-6 rounded-2xl bg-[#FAF9F5] p-4">
          <p className="text-sm font-bold text-[#2C3531]">
            {nickname}가 {stageLabels[newStage]}(으)로 성장했어요!
          </p>
          <p className="mt-1 text-xs text-gray-500">
            앞으로도 미션을 완료하고 함께 성장해나가요.
          </p>
        </div>

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
            onClick={onClose}
            className="flex-1 rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
          >
            디노룸 가기
          </button>
        </div>
      </div>
    </div>
  );
}
