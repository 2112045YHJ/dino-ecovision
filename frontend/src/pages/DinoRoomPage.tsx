// src/pages/DinoRoomPage.tsx

import { useState } from "react";
import { mockMyDino } from "../mocks/dinoMock";
import {
  dinoEmotionImages,
  dinoImages,
} from "../assets/images/dinos/dinoImages";

export function DinoRoomPage() {
  // message는 공룡 아래에 보여줄 말풍선 문구입니다.
  const [message, setMessage] = useState("공룡을 클릭해보세요!");

  // isHappy는 공룡이 기뻐하는 상태인지 저장합니다.
  const [isHappy, setIsHappy] = useState(false);

  // 백엔드 API가 없으므로 지금은 Mock 데이터를 사용합니다.
  const dino = mockMyDino;

  // EXP 진행률을 계산합니다.
  // 예: 120 / 300 * 100 = 40%
  const expPercent = Math.min((dino.exp / dino.requiredExp) * 100, 100);

  // 화면에 보여줄 공룡 이미지입니다.
  // HATCHLING 단계이고, 기뻐하는 상태라면 happy 이미지를 보여줍니다.
  // 그 외에는 현재 성장 단계의 기본 이미지를 보여줍니다.
  const currentDinoImage =
    dino.stage === "HATCHLING" && isHappy
      ? dinoEmotionImages.HATCHLING_HAPPY
      : dinoImages[dino.stage];

  // 공룡을 클릭했을 때 실행되는 함수입니다.
  const handleDinoClick = () => {
    setIsHappy(true);
    setMessage(`${dino.name}가 기뻐해요!`);

    // 1.5초 뒤에 다시 기본 표정으로 돌아옵니다.
    setTimeout(() => {
      setIsHappy(false);
      setMessage("공룡을 클릭해보세요!");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">DINO ROOM</p>

          <h1 className="mt-2 text-2xl font-bold">나의 디노 룸</h1>

          <div className="mt-6 flex flex-col items-center rounded-3xl bg-[#E8F2EC] p-6">
            <button
              type="button"
              onClick={handleDinoClick}
              className="transition hover:scale-105"
            >
              <img
                src={currentDinoImage}
                alt={`${dino.name} 이미지`}
                className="h-64 object-contain"
              />
            </button>

            <p className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#5F8C74]">
              {message}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold">{dino.name}</h2>

            <p className="mt-1 text-sm text-gray-600">
              현재 성장 단계: {dino.stage}
            </p>

            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>EXP</span>
                <span>
                  {dino.exp} / {dino.requiredExp}
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-[#E8F2EC]">
                <div
                  className="h-full rounded-full bg-[#5F8C74]"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-sm text-gray-600">친밀도</p>
              <p className="text-lg font-bold text-[#E07A5F]">
                {dino.intimacy}%
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
