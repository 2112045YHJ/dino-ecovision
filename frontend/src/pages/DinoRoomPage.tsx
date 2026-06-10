// src/pages/DinoRoomPage.tsx

import { useState } from "react";
import {
  dinoImagesByType,
  dinoHappyImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

// 디노룸 배경 이미지입니다.
// 파일 위치: src/assets/images/dinos/dino-room-bg.png
import dinoRoomBg from "../assets/images/dinos/dino-room-bg.png";

export function DinoRoomPage() {
  // isHappy는 공룡이 지금 행복한 상태인지 저장합니다.
  // false = 기본 이미지
  // true = 행복 이미지
  const [isHappy, setIsHappy] = useState(false);

  // 공룡 아래 말풍선 문구입니다.
  const [message, setMessage] = useState("공룡을 클릭해보세요!");

  // 아직 백엔드 공룡 API가 없으므로 localStorage에 저장된 공룡 정보를 사용합니다.
  const savedDinoText = localStorage.getItem("myDino");

  // localStorage에 공룡 정보가 있으면 그 값을 사용합니다.
  // 없으면 기본값으로 용각류 유아기 공룡을 보여줍니다.
  const savedDino = savedDinoText
    ? (JSON.parse(savedDinoText) as {
        type: DinoType;
        name: string;
        stage: DinoStage;
        exp: number;
        maxExp: number;
        affinity: number;
      })
    : {
        type: "SAURO" as DinoType,
        name: "초록초록이",
        stage: "HATCHLING" as DinoStage,
        exp: 120,
        maxExp: 300,
        affinity: 45,
      };

  // EXP 진행률을 계산합니다.
  // 예: 120 / 300 * 100 = 40
  const expPercent = Math.min((savedDino.exp / savedDino.maxExp) * 100, 100);

  // 기본 공룡 이미지입니다.
  // 예: SAURO + HATCHLING이면 sauro-hatchling.png가 나옵니다.
  const normalImage = dinoImagesByType[savedDino.type][savedDino.stage];

  // 행복한 공룡 이미지입니다.
  // 해당 단계의 행복 이미지가 없으면 기본 이미지를 대신 사용합니다.
  const happyImage =
    dinoHappyImagesByType[savedDino.type]?.[savedDino.stage] ?? normalImage;

  // 실제 화면에 보여줄 공룡 이미지입니다.
  // isHappy가 true면 행복 이미지, false면 기본 이미지입니다.
  const currentDinoImage = isHappy ? happyImage : normalImage;

  // 공룡 성장 단계 한글 표시용입니다.
  const stageTextMap: Record<DinoStage, string> = {
    EGG: "알",
    HATCHLING: "유아기",
    JUVENILE: "청소년기",
    ADULT: "성룡",
  };

  // 공룡 종류 한글 표시용입니다.
  const typeTextMap: Record<DinoType, string> = {
    TYRANO: "티라노",
    SAURO: "용각류",
    CERATO: "각룡류",
  };

  // 공룡을 클릭했을 때 실행되는 함수입니다.
  const handleDinoClick = () => {
    // 공룡을 행복 상태로 바꿉니다.
    setIsHappy(true);

    // 말풍선 문구를 바꿉니다.
    setMessage(`${savedDino.name}가 기뻐해요!`);

    // 1.5초 뒤에 다시 기본 상태로 돌아갑니다.
    setTimeout(() => {
      setIsHappy(false);
      setMessage("공룡을 클릭해보세요!");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] px-4 py-6 text-[#2C3531]">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          {/* 상단 제목 영역 */}
          <header>
            <p className="text-sm font-bold tracking-wide text-[#5F8C74]">
              DINO ROOM
            </p>

            <h1 className="mt-2 text-3xl font-bold">나의 디노 룸</h1>

            <p className="mt-2 text-sm text-gray-600">
              공룡을 클릭하면 잠깐 기분 좋은 모습으로 바뀌어요.
            </p>
          </header>

          {/* 디노룸 배경 영역 */}
          <div
            className="relative mt-6 flex min-h-[430px] flex-col items-center justify-end overflow-hidden rounded-[32px] bg-cover bg-center px-6 pb-8 pt-10 shadow-inner"
            style={{ backgroundImage: `url(${dinoRoomBg})` }}
          >
            {/* 배경 위에 아주 살짝 밝은 막을 씌워서 공룡이 더 잘 보이게 합니다. */}
            <div className="absolute inset-0 bg-white/10" />

            {/* 상단 작은 안내 배지 */}
            <div className="absolute left-5 top-5 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-[#5F8C74] shadow-sm backdrop-blur">
              오늘도 성장 중 🌱
            </div>

            {/* 공룡 이미지 버튼 */}
            <button
              type="button"
              onClick={handleDinoClick}
              className="relative z-10 transition hover:scale-105 active:scale-95"
            >
              <img
                src={currentDinoImage}
                alt={`${savedDino.name} 이미지`}
                className={`h-72 object-contain drop-shadow-xl transition duration-300 ${
                  isHappy ? "scale-110 -translate-y-3" : "scale-100"
                }`}
              />
            </button>

            {/* 말풍선 */}
            <p className="relative z-10 mt-4 rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-[#5F8C74] shadow-sm backdrop-blur">
              {message}
            </p>
          </div>

          {/* 공룡 이름 / 상태 영역 */}
          <section className="mt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[#5F8C74]">
                  {typeTextMap[savedDino.type]}
                </p>

                <h2 className="mt-1 text-2xl font-bold">{savedDino.name}</h2>

                <p className="mt-1 text-sm text-gray-600">
                  현재 성장 단계: {stageTextMap[savedDino.stage]}{" "}
                  <span className="text-gray-400">({savedDino.stage})</span>
                </p>
              </div>

              <div className="rounded-full bg-[#E8F2EC] px-4 py-2 text-sm font-bold text-[#5F8C74]">
                친밀도 {savedDino.affinity}%
              </div>
            </div>

            {/* 상태 카드 3개 */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <article className="rounded-3xl bg-[#FAF9F5] p-4">
                <p className="text-sm text-gray-500">종류</p>
                <p className="mt-1 text-lg font-bold text-[#2C3531]">
                  {typeTextMap[savedDino.type]}
                </p>
              </article>

              <article className="rounded-3xl bg-[#FAF9F5] p-4">
                <p className="text-sm text-gray-500">성장 단계</p>
                <p className="mt-1 text-lg font-bold text-[#2C3531]">
                  {stageTextMap[savedDino.stage]}
                </p>
              </article>

              <article className="rounded-3xl bg-[#FAF9F5] p-4">
                <p className="text-sm text-gray-500">친밀도</p>
                <p className="mt-1 text-lg font-bold text-[#E07A5F]">
                  {savedDino.affinity}%
                </p>
              </article>
            </div>

            {/* EXP 바 */}
            <div className="mt-5 rounded-3xl bg-[#FAF9F5] p-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-bold text-[#5F8C74]">EXP</span>

                <span className="font-bold">
                  {savedDino.exp} / {savedDino.maxExp}
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-[#E8F2EC]">
                <div
                  className="h-full rounded-full bg-[#5F8C74] transition-all duration-300"
                  style={{ width: `${expPercent}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-gray-500">
                미션과 퀴즈를 완료하면 공룡 EXP와 친밀도가 올라가요.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
