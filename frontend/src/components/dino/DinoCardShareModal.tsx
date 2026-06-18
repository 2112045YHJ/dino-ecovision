// src/components/dino/DinoCardShareModal.tsx

import { useState } from "react";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../../assets/images/dinos/dinoImages";

type ThemeColor = "green" | "cream" | "gold";

type Props = {
  nickname: string;
  dinoType: DinoType;
  dinoStage: DinoStage;
  templateName: string;
  savedCarbonKg: number;
  guildName?: string;
  onClose: () => void;
};

const stageLabels: Record<DinoStage, string> = {
  EGG: "알",
  HATCHLING: "유아기",
  JUVENILE: "청소년기",
  ADULT: "성룡",
};

const themeStyles: Record<
  ThemeColor,
  { bg: string; border: string; label: string }
> = {
  green: {
    bg: "bg-[#E8F2EC]",
    border: "border-[#5F8C74]",
    label: "그린",
  },
  cream: {
    bg: "bg-[#FAF9F5]",
    border: "border-gray-300",
    label: "크림",
  },
  gold: {
    bg: "bg-[#FFF8E7]",
    border: "border-[#F2CC8F]",
    label: "골드",
  },
};

export function DinoCardShareModal({
  nickname,
  dinoType,
  dinoStage,
  templateName,
  savedCarbonKg,
  guildName,
  onClose,
}: Props) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>("green");
  const [isSaved, setIsSaved] = useState(false);

  const dinoImage = dinoImagesByType[dinoType][dinoStage];
  const stageLabel = stageLabels[dinoStage];
  const theme = themeStyles[selectedTheme];

  const handleSave = async () => {
    try {
      // TODO: html2canvas 등 이미지 저장 라이브러리 연결 시 교체하세요.
      // const canvas = await html2canvas(cardRef.current);
      // canvas.toBlob((blob) => { ... });

      await new Promise((resolve) => setTimeout(resolve, 600));

      setIsSaved(true);

      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        {/* 타이틀 */}
        <h2 className="text-center text-lg font-bold text-[#5F8C74]">
          🦖 에코 디노 자랑 카드 발급
        </h2>

        {/* 카드 프리뷰 */}
        <div
          className={`mt-5 flex flex-col items-center gap-3 rounded-3xl border-2 p-6 text-center ${theme.bg} ${theme.border}`}
        >
          <img
            src={dinoImage}
            alt={`${templateName} ${stageLabel}`}
            className="h-28 object-contain drop-shadow"
          />

          <p className="text-lg font-bold text-[#2C3531]">
            {nickname}{" "}
            <span className="text-sm font-normal text-gray-500">
              ({stageLabel})
            </span>
          </p>

          <p className="text-xs font-bold text-[#5F8C74]">
            지구를 지키는 훌륭한 동반자
          </p>

          <p className="text-xs text-gray-500">
            EcoVision 친환경 공헌 {savedCarbonKg} kg CO₂ 감축 달성
          </p>

          {guildName && (
            <span className="rounded-full border border-[#5F8C74] bg-white px-3 py-1 text-xs font-bold text-[#5F8C74]">
              {guildName} 소속
            </span>
          )}
        </div>

        {/* 테마 선택 */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-gray-600">배경 템플릿 선택:</span>

          <div className="flex gap-2">
            {(Object.keys(themeStyles) as ThemeColor[]).map((theme) => (
              <button
                key={theme}
                type="button"
                title={themeStyles[theme].label}
                onClick={() => setSelectedTheme(theme)}
                className={`h-6 w-6 rounded-full border-2 transition ${
                  themeStyles[theme].bg
                } ${
                  selectedTheme === theme
                    ? "border-[#5F8C74] scale-110"
                    : "border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 저장 완료 안내 */}
        {isSaved && (
          <div className="mt-4 rounded-2xl bg-[#E8F2EC] p-3 text-center text-sm font-bold text-[#5F8C74]">
            이미지가 저장되었습니다! (시뮬레이션)
          </div>
        )}

        {/* 버튼 */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-300 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            닫기
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
          >
            🖼️ 이미지 저장
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-gray-400">
          실제 저장 기능은 html2canvas 라이브러리 연결 시 동작합니다.
        </p>
      </div>
    </div>
  );
}
