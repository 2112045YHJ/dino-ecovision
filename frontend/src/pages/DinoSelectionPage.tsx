// src/pages/DinoSelectionPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { hatchDino } from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

/*
  이 페이지에서 하는 일

  1. 사용자가 키울 공룡 타입을 선택합니다.
  2. 공룡 이름을 입력합니다.
  3. POST /api/me/dino/hatch API를 호출해서 첫 공룡을 생성합니다.
  4. 성공하면 홈 화면으로 이동합니다.
  5. 이미 공룡이 있는 계정이면 409 에러를 사용자 친화적으로 처리합니다.

  왜 409 처리가 필요할까?

  409는 보통 "이미 존재한다", "이미 처리된 상태다"라는 뜻입니다.
  예를 들어 이미 공룡을 선택한 사용자가 다시 공룡 선택을 시도하면,
  백엔드는 "이미 공룡이 있습니다"라는 의미로 409를 줄 수 있습니다.

  이때 화면이 그냥 에러로 끝나면 발표 중에 당황할 수 있으므로,
  디노룸으로 이동할 수 있는 버튼을 보여줍니다.
*/

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

// 에러 객체에서 화면에 보여줄 메시지를 안전하게 꺼내는 함수입니다.
function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

// 이미 공룡이 있는 상태인지 확인하는 함수입니다.
function isAlreadyHasDinoError(message: string) {
  return (
    message.includes("409") ||
    message.includes("이미") ||
    message.includes("공룡") ||
    message.includes("DINO_ALREADY_EXISTS") ||
    message.includes("ALREADY_HAS_DINO") ||
    message.includes("already")
  );
}

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

  // 이미 공룡이 있는 계정인지 저장합니다.
  const [alreadyHasDino, setAlreadyHasDino] = useState(false);

  // 공룡 이름 입력값이 바뀔 때 실행됩니다.
  const handleDinoNameChange = (value: string) => {
    setDinoName(value);
    setErrorMessage("");
    setAlreadyHasDino(false);
  };

  // 공룡 타입 카드를 클릭했을 때 실행됩니다.
  const handleSelectDinoType = (dinoType: DinoType) => {
    setSelectedDinoType(dinoType);
    setErrorMessage("");
    setAlreadyHasDino(false);
  };

  // 공룡 선택 완료 버튼을 눌렀을 때 실행됩니다.
  const handleSubmit = async () => {
    const trimmedDinoName = dinoName.trim();

    if (!trimmedDinoName) {
      setErrorMessage("공룡 이름을 입력해주세요.");
      setAlreadyHasDino(false);
      return;
    }

    if (trimmedDinoName.length < 2) {
      setErrorMessage("공룡 이름은 2자 이상 입력해주세요.");
      setAlreadyHasDino(false);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setAlreadyHasDino(false);

      // 백엔드에 첫 공룡 선택 정보를 저장합니다.
      // dinoApi.ts 안에서 TYRANO / SAURO / CERATO가 templateId로 바뀝니다.
      const createdDino = await hatchDino({
        dinoType: selectedDinoType,
        nickname: trimmedDinoName,
      });

      /*
        아직 일부 화면이 localStorage를 참고할 가능성이 있어서 임시 저장합니다.

        현재 HomePage / DinoRoomPage / DinoCollectionPage는
        GET /api/me/dino 기반으로 정리했기 때문에,
        나중에는 이 localStorage 저장 로직을 삭제해도 됩니다.
      */
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

      const message = getErrorMessage(
        error,
        "공룡 선택 정보를 저장하지 못했습니다.",
      );

      /*
        이미 공룡이 있는 계정이면,
        에러만 보여주고 끝내지 않고 디노룸으로 이동할 수 있게 합니다.
      */
      if (isAlreadyHasDinoError(message)) {
        setAlreadyHasDino(true);
        setErrorMessage(
          "이미 선택한 디노가 있어요. 디노룸에서 내 디노를 확인해주세요.",
        );
        return;
      }

      setAlreadyHasDino(false);
      setErrorMessage(message || "공룡 선택 정보를 저장하지 못했습니다.");
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
                onClick={() => handleSelectDinoType(dino.type)}
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
            <div
              className={`mt-4 rounded-2xl p-4 text-sm font-bold ${
                alreadyHasDino
                  ? "bg-[#E8F2EC] text-[#5F8C74]"
                  : "bg-[#FFF0EA] text-[#E07A5F]"
              }`}
            >
              {errorMessage}

              {alreadyHasDino && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => navigate("/dino-room")}
                    className="rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
                  >
                    디노룸으로 가기
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/home")}
                    className="rounded-2xl border border-[#5F8C74] bg-white py-3 font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
                  >
                    홈으로 가기
                  </button>
                </div>
              )}
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

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-3 w-full rounded-2xl border border-[#5F8C74] py-3 font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            홈으로 돌아가기
          </button>
        </section>
      </section>
    </main>
  );
}
