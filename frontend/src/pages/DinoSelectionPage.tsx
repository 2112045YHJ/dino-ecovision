// src/pages/DinoSelectionPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  dinoImagesByType,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

// 공룡 선택 카드에 들어갈 데이터 타입입니다.
// 쉽게 말하면 "공룡 알 카드 설명서"입니다.
interface DinoEggOption {
  id: DinoType; // TYRANO, SAURO, CERATO 중 하나
  name: string; // 화면에 보여줄 이름
  description: string; // 화면에 보여줄 설명
}

// 첫 공룡 선택 화면에 보여줄 공룡 알 목록입니다.
const dinoEggOptions: DinoEggOption[] = [
  {
    id: "TYRANO",
    name: "티라노 알",
    description: "씩씩하고 에너지가 넘치는 공룡이에요.",
  },
  {
    id: "SAURO",
    name: "용각류 알",
    description: "차분하고 듬직한 성격의 공룡이에요.",
  },
  {
    id: "CERATO",
    name: "각룡류 알",
    description: "호기심 많고 귀여운 성격의 공룡이에요.",
  },
];

export function DinoSelectionPage() {
  // 다른 페이지로 이동할 때 사용하는 함수입니다.
  const navigate = useNavigate();

  // 사용자가 선택한 공룡 종류를 저장합니다.
  // 처음에는 아무것도 선택하지 않았으므로 null입니다.
  const [selectedDinoType, setSelectedDinoType] = useState<DinoType | null>(
    null,
  );

  // 사용자가 입력한 공룡 이름을 저장합니다.
  const [dinoName, setDinoName] = useState("");

  // 에러 메시지를 저장합니다.
  const [errorMessage, setErrorMessage] = useState("");

  // "선택 완료하고 시작하기" 버튼을 눌렀을 때 실행됩니다.
  const handleSubmit = () => {
    // 버튼을 다시 누를 때마다 이전 에러 메시지는 먼저 지웁니다.
    setErrorMessage("");

    // 공룡 알을 선택하지 않았을 때
    if (!selectedDinoType) {
      setErrorMessage("함께할 공룡 알을 선택해주세요.");
      return;
    }

    // 공룡 이름을 입력하지 않았을 때
    if (!dinoName.trim()) {
      setErrorMessage("공룡 이름을 입력해주세요.");
      return;
    }

    // 공룡 이름이 너무 짧을 때
    if (dinoName.trim().length < 2) {
      setErrorMessage("공룡 이름은 2글자 이상 입력해주세요.");
      return;
    }

    // 지금은 백엔드 API가 없으므로 localStorage에 임시 저장합니다.
    // localStorage는 브라우저 안에 잠깐 데이터를 저장하는 보관함입니다.
    localStorage.setItem(
      "myDino",
      JSON.stringify({
        type: selectedDinoType,
        name: dinoName.trim(),
        stage: "HATCHLING",
        exp: 0,
        maxExp: 300,
        affinity: 0,
      }),
    );

    alert(`${dinoName.trim()}와 함께 EcoVision을 시작합니다!`);

    // 선택이 끝나면 홈 화면으로 이동합니다.
    navigate("/home");
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center">
        <div className="w-full rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">DINO STARTER</p>

          <h1 className="mt-2 text-3xl font-bold">첫 공룡 알 선택</h1>

          <p className="mt-2 text-sm text-gray-600">
            EcoVision에서 함께 성장할 첫 번째 공룡 알을 선택해주세요.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {dinoEggOptions.map((egg) => {
              // 현재 카드가 선택된 카드인지 확인합니다.
              const isSelected = selectedDinoType === egg.id;

              return (
                <button
                  key={egg.id}
                  type="button"
                  onClick={() => setSelectedDinoType(egg.id)}
                  className={`rounded-3xl border p-4 text-left transition hover:scale-[1.02] ${
                    isSelected
                      ? "border-[#5F8C74] bg-[#E8F2EC] shadow-sm"
                      : "border-[#E8F2EC] bg-white hover:bg-[#FAF9F5]"
                  }`}
                >
                  <div className="flex h-36 items-center justify-center rounded-3xl bg-[#FAF9F5]">
                    <img
                      src={dinoImagesByType[egg.id].EGG}
                      alt={`${egg.name} 이미지`}
                      className="h-28 object-contain"
                    />
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-[#2C3531]">
                    {egg.name}
                  </h2>

                  <p className="mt-2 text-sm text-gray-600">
                    {egg.description}
                  </p>

                  {isSelected && (
                    <p className="mt-3 rounded-full bg-[#5F8C74] px-3 py-1 text-center text-xs font-bold text-white">
                      선택됨
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <label className="mt-6 grid gap-2">
            <span className="text-sm font-bold text-[#5F8C74]">공룡 이름</span>

            <input
              type="text"
              value={dinoName}
              onChange={(event) => setDinoName(event.target.value)}
              placeholder="예: 초록초록이"
              className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 outline-none focus:border-[#5F8C74]"
            />
          </label>

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-[#FFF1EC] px-4 py-3 text-sm font-bold text-[#E07A5F]">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
            onClick={handleSubmit}
          >
            선택 완료하고 시작하기
          </button>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-[#E8F2EC] bg-white py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            onClick={() => navigate("/onboarding/profile")}
          >
            이전 단계로 돌아가기
          </button>

          <p className="mt-5 text-center text-xs text-gray-500">
            현재는 Mock 데이터 기준입니다. 백엔드 API 완성 후 선택한 공룡 종류와
            공룡 이름을 서버에 저장할 예정입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
