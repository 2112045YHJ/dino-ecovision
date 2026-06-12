// src/pages/DinoSelectionPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { hatchDino } from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

// 화면에 보여줄 공룡 선택 목록입니다.
// 프론트에서는 TYRANO / SAURO / CERATO 이름을 사용합니다.
const dinoOptions: {
  type: DinoType;
  title: string;
  description: string;
}[] = [
  {
    type: "TYRANO",
    title: "티라노",
    description: "씩씩하고 에너지가 넘치는 디노예요.",
  },
  {
    type: "SAURO",
    title: "용각류",
    description: "차분하고 다정한 긴 목 디노예요.",
  },
  {
    type: "CERATO",
    title: "각룡류",
    description: "단단하고 믿음직한 뿔 디노예요.",
  },
];

export function DinoSelectionPage() {
  // 페이지 이동을 도와주는 함수입니다.
  const navigate = useNavigate();

  // 사용자가 선택한 공룡 타입입니다.
  const [selectedDinoType, setSelectedDinoType] = useState<DinoType>("SAURO");

  // 사용자가 입력한 공룡 이름입니다.
  const [dinoName, setDinoName] = useState("");

  // 저장 중인지 저장합니다.
  const [isSaving, setIsSaving] = useState(false);

  // 에러 메시지입니다.
  const [errorMessage, setErrorMessage] = useState("");

  // 공룡 이름 입력값이 바뀔 때 실행됩니다.
  const handleDinoNameChange = (value: string) => {
    setDinoName(value);
    setErrorMessage("");
  };

  // 공룡 선택 완료 버튼을 눌렀을 때 실행됩니다.
  const handleSubmit = async () => {
    const trimmedDinoName = dinoName.trim();

    if (!trimmedDinoName) {
      setErrorMessage("공룡 이름을 입력해주세요.");
      return;
    }

    if (trimmedDinoName.length < 2) {
      setErrorMessage("공룡 이름은 2자 이상 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      // 백엔드에 첫 공룡 선택 정보를 저장합니다.
      // dinoApi.ts 안에서 TYRANO / SAURO / CERATO가 templateId로 바뀝니다.
      const createdDino = await hatchDino({
        dinoType: selectedDinoType,
        nickname: trimmedDinoName,
      });

      // 아직 HomePage나 DinoRoomPage가 localStorage를 참고하는 부분이 있을 수 있어서
      // 화면 표시용으로 임시 저장해둡니다.
      // 나중에 모든 화면이 GET /api/me/dino로 바뀌면 이 부분은 지워도 됩니다.
      localStorage.setItem(
        "myDino",
        JSON.stringify({
          type: selectedDinoType,
          name: createdDino.nickname,
          stage: createdDino.stage,
          exp: createdDino.exp,
          maxExp: 100,
          affinity: createdDino.affinity,
        }),
      );

      // 공룡 선택까지 끝났으므로 홈 화면으로 이동합니다.
      navigate("/home");
    } catch (error) {
      console.error(error);
      setErrorMessage("공룡 선택 정보를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <p className="text-sm font-bold text-[#5F8C74]">DINO SELECTION</p>

          <h1 className="mt-2 text-3xl font-bold">
            함께 성장할 공룡을 선택해주세요
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            탄소 절감 미션을 완료하면 선택한 공룡이 경험치를 얻고 성장해요.
          </p>
        </header>

        {/* 공룡 선택 카드 영역 */}
        <section className="grid gap-4 md:grid-cols-3">
          {dinoOptions.map((dino) => {
            const isSelected = selectedDinoType === dino.type;

            return (
              <button
                key={dino.type}
                type="button"
                onClick={() => {
                  setSelectedDinoType(dino.type);
                  setErrorMessage("");
                }}
                className={`rounded-3xl border-2 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  isSelected ? "border-[#5F8C74]" : "border-transparent"
                }`}
              >
                <div className="flex h-48 items-center justify-center rounded-3xl bg-[#E8F2EC]">
                  <img
                    src={dinoImagesByType[dino.type].EGG}
                    alt={`${dino.title} 알 이미지`}
                    className="h-36 object-contain"
                  />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold">{dino.title}</h2>

                    {isSelected && (
                      <span className="rounded-full bg-[#5F8C74] px-3 py-1 text-xs font-bold text-white">
                        선택됨
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {dino.description}
                  </p>
                </div>
              </button>
            );
          })}
        </section>

        {/* 공룡 이름 입력 영역 */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <label
            htmlFor="dinoName"
            className="block text-sm font-bold text-[#2C3531]"
          >
            공룡 이름
          </label>

          <input
            id="dinoName"
            type="text"
            value={dinoName}
            onChange={(event) => handleDinoNameChange(event.target.value)}
            placeholder="예: 초록초록이"
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
          />

          <p className="mt-2 text-xs text-gray-500">
            선택한 공룡에게 부를 이름을 붙여주세요.
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
          >
            {isSaving ? "저장 중..." : "공룡 선택 완료"}
          </button>
        </section>
      </section>
    </main>
  );
}
