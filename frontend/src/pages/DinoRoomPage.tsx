// src/pages/DinoRoomPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

interface MyDino {
  type: DinoType;
  name: string;
  stage: DinoStage;
  exp: number;
  maxExp: number;
  affinity: number;
}

const defaultDino: MyDino = {
  type: "SAURO",
  name: "초록초록이",
  stage: "HATCHLING",
  exp: 120,
  maxExp: 300,
  affinity: 45,
};

export function DinoRoomPage() {
  const navigate = useNavigate();

  // 현재 화면에 보여줄 내 공룡 정보입니다.
  const [myDino, setMyDino] = useState<MyDino>(defaultDino);

  // 공룡을 클릭했는지 확인하는 상태입니다.
  // true가 되면 공룡이 살짝 커지고 말풍선 문구가 바뀝니다.
  const [isHappy, setIsHappy] = useState(false);

  // 화면이 처음 열릴 때 localStorage에서 저장된 공룡 정보를 가져옵니다.
  useEffect(() => {
    const savedDino = localStorage.getItem("myDino");

    if (!savedDino) {
      return;
    }

    try {
      const parsedDino = JSON.parse(savedDino) as MyDino;

      setMyDino({
        type: parsedDino.type ?? defaultDino.type,
        name: parsedDino.name ?? defaultDino.name,
        stage: parsedDino.stage ?? defaultDino.stage,
        exp: parsedDino.exp ?? defaultDino.exp,
        maxExp: parsedDino.maxExp ?? defaultDino.maxExp,
        affinity: parsedDino.affinity ?? defaultDino.affinity,
      });
    } catch {
      setMyDino(defaultDino);
    }
  }, []);

  // 경험치 진행률입니다.
  // 예: 120 / 300 = 40%
  const expPercent = Math.round((myDino.exp / myDino.maxExp) * 100);

  // 현재 공룡 이미지입니다.
  // 핵심: 공룡 종류 + 성장 단계로 이미지를 고릅니다.
  const currentDinoImage = dinoImagesByType[myDino.type][myDino.stage];

  // 공룡을 클릭했을 때 실행됩니다.
  const handleDinoClick = () => {
    setIsHappy(true);

    // 1.2초 뒤에 다시 원래 상태로 돌아옵니다.
    setTimeout(() => {
      setIsHappy(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-3xl">
        <button
          type="button"
          className="mb-4 rounded-2xl border border-[#E8F2EC] bg-white px-4 py-2 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          onClick={() => navigate("/home")}
        >
          홈으로 돌아가기
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">DINO ROOM</p>

          <h1 className="mt-2 text-3xl font-bold">나의 디노 룸</h1>

          <div className="mt-8 rounded-3xl bg-[#E8F2EC] p-6">
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleDinoClick}
                className="cursor-pointer border-0 bg-transparent p-0"
              >
                <img
                  src={currentDinoImage}
                  alt={`${myDino.name} 이미지`}
                  className={`h-64 object-contain transition duration-300 ${
                    isHappy ? "scale-110 rotate-2" : "scale-100"
                  }`}
                />
              </button>

              <p className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-bold text-[#5F8C74]">
                {isHappy
                  ? `${myDino.name}가 기뻐해요!`
                  : "공룡을 클릭해보세요!"}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-bold">{myDino.name}</h2>

            <p className="mt-2 text-sm text-gray-600">
              현재 성장 단계: {myDino.stage}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              공룡 종류: {myDino.type}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold">EXP</span>

                <span className="text-sm">
                  {myDino.exp} / {myDino.maxExp}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#E8F2EC]">
                <div
                  className="h-full rounded-full bg-[#5F8C74]"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-sm text-gray-600">친밀도</p>

              <p className="mt-1 text-2xl font-bold text-[#E07A5F]">
                {myDino.affinity}%
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
