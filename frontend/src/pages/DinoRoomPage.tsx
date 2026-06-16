// src/pages/DinoRoomPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyDino, type MyDinoResponse } from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

import dinoRoomBg from "../assets/images/dinos/dino-room-bg.png";

import { DinoCardShareModal } from "../components/dino/DinoCardShareModal";
import { DinoEvolutionModal } from "../components/dino/DinoEvolutionModal";
/*
  이 파일에서 하는 일

  1. GET /api/me/dino 로 내 디노 정보를 불러옵니다.
  2. 백엔드에서 받은 디노 타입/성장 단계를 프론트 이미지 타입에 맞게 바꿉니다.
  3. 디노룸 화면에 공룡 이미지, EXP, 친밀도, 성장 안내를 보여줍니다.
  4. 다음 성장까지 남은 EXP를 보여줍니다.
  5. 공룡 정보가 없을 때 홈/공룡 선택 화면으로 이동할 수 있게 합니다.
*/

/* =========================
   공룡 타입 안전 변환 함수
   ========================= */

function getSafeDinoType(dino: MyDinoResponse): DinoType {
  const templateCode = String(dino.templateCode ?? "").toUpperCase();
  const templateName = String(dino.templateName ?? "").toUpperCase();

  if (templateCode === "TYRANO") {
    return "TYRANO";
  }

  if (templateCode === "SAURO" || templateCode === "BRACHIO") {
    return "SAURO";
  }

  if (templateCode === "CERATO" || templateCode === "TRICERA") {
    return "CERATO";
  }

  if (templateName.includes("티라노") || templateName.includes("TYRANO")) {
    return "TYRANO";
  }

  if (
    templateName.includes("용각") ||
    templateName.includes("브라키오") ||
    templateName.includes("BRACHIO") ||
    templateName.includes("SAURO")
  ) {
    return "SAURO";
  }

  if (
    templateName.includes("각룡") ||
    templateName.includes("트리케라") ||
    templateName.includes("TRICERA") ||
    templateName.includes("CERATO")
  ) {
    return "CERATO";
  }

  return "TYRANO";
}

/* =========================
   성장 단계 안전 변환 함수
   ========================= */

function getSafeDinoStage(stage?: string | null): DinoStage {
  const safeStage = String(stage ?? "").toUpperCase();

  if (safeStage === "EGG") {
    return "EGG";
  }

  if (safeStage === "HATCHLING") {
    return "HATCHLING";
  }

  if (safeStage === "JUVENILE") {
    return "JUVENILE";
  }

  if (safeStage === "ADULT") {
    return "ADULT";
  }

  return "EGG";
}

/* =========================
   성장 단계 한글 표시 함수
   ========================= */

function getStageLabel(stage: DinoStage) {
  if (stage === "EGG") {
    return "알";
  }

  if (stage === "HATCHLING") {
    return "유아기";
  }

  if (stage === "JUVENILE") {
    return "청소년기";
  }

  if (stage === "ADULT") {
    return "성룡";
  }

  return "알";
}

/* =========================
   이전 성장 단계 반환 함수
   ========================= */

function getPrevStage(stage: DinoStage): DinoStage {
  if (stage === "HATCHLING") return "EGG";
  if (stage === "JUVENILE") return "HATCHLING";
  if (stage === "ADULT") return "JUVENILE";
  return "EGG";
}

/* =========================
   디노룸 페이지
   ========================= */

export function DinoRoomPage() {
  const navigate = useNavigate();

  const [dino, setDino] = useState<MyDinoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [message, setMessage] = useState("공룡을 클릭해보세요!");
  const [isHappy, setIsHappy] = useState(false);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);

  useEffect(() => {
    const fetchMyDino = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMyDino();

        setDino(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("내 공룡 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyDino();
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-6 text-[#2C3531]">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">DINO ROOM</p>
          <p className="mt-2 text-lg font-bold">공룡 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !dino) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-6 text-[#2C3531]">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#E07A5F]">ERROR</p>

          <h1 className="mt-2 text-xl font-bold">
            공룡 정보를 불러오지 못했어요
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            공룡 선택을 완료했는지 확인해주세요.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              홈으로 가기
            </button>

            <button
              type="button"
              onClick={() => navigate("/onboarding/dino")}
              className="rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
            >
              공룡 선택하러 가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  const dinoType = getSafeDinoType(dino);
  const dinoStage = getSafeDinoStage(dino.stage);
  const dinoStageLabel = getStageLabel(dinoStage);
  const prevStage = getPrevStage(dinoStage);


  /*
    nextStageExp는 백엔드 응답에 따라 null일 수도 있다고 보고 방어합니다.

    왜 이렇게 하냐면?
    성룡처럼 최종 단계에 도달하면 다음 단계가 없기 때문에
    nextStageExp가 없거나 null로 올 수 있기 때문입니다.
  */
  const rawNextStageExp = dino.nextStageExp as number | null | undefined;

  const isMaxStage = dinoStage === "ADULT" || rawNextStageExp == null;

  const nextStageExp = isMaxStage ? dino.exp : Math.max(rawNextStageExp, 1);

  const remainingExp = isMaxStage ? 0 : Math.max(nextStageExp - dino.exp, 0);

  const expPercent = isMaxStage
    ? 100
    : Math.min((dino.exp / nextStageExp) * 100, 100);

  const currentDinoImage = dinoImagesByType[dinoType][dinoStage];

  const handleDinoClick = () => {
    setIsHappy(true);
    setMessage(`${dino.nickname}가 기뻐해요!`);

    setTimeout(() => {
      setIsHappy(false);
      setMessage("공룡을 클릭해보세요!");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">DINO ROOM</p>

            <h1 className="mt-2 text-3xl font-bold">나의 디노 룸</h1>

            <p className="mt-2 text-sm text-gray-600">
              미션을 완료하고 공룡을 성장시켜보세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              홈으로 가기
            </button>

            <button
              type="button"
              onClick={() => navigate("/dino-collection")}
              className="rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
            >
              디노 도감 보기
            </button>

            <button
              type="button"
              onClick={() => navigate("/dino-growth")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              성장 비교 보기
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div
              className="relative flex items-end justify-center bg-cover bg-center"
              style={{
                backgroundImage: `url(${dinoRoomBg})`,
                minHeight: "520px",
              }}
            >
              <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-[#5F8C74] shadow-sm">
                {message}
              </div>

              <button
                type="button"
                onClick={handleDinoClick}
                className={`mb-8 transition ${
                  isHappy ? "scale-105" : "hover:scale-105"
                }`}
              >
                <img
                  src={currentDinoImage}
                  alt={`${dino.nickname} 이미지`}
                  className="h-72 object-contain drop-shadow-xl"
                />
              </button>
            </div>
          </article>

          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">MY DINO</p>

            <h2 className="mt-2 text-2xl font-bold">{dino.nickname}</h2>

            <p className="mt-1 text-sm text-gray-600">
              종류: {dino.templateName}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              현재 성장 단계: {dinoStageLabel}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>EXP</span>
                <span>
                  {dino.exp} / {isMaxStage ? "MAX" : nextStageExp}
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-[#E8F2EC]">
                <div
                  className="h-full rounded-full bg-[#5F8C74]"
                  style={{ width: `${expPercent}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {isMaxStage
                  ? "최종 성장 단계에 도달했어요."
                  : `다음 성장까지 ${remainingExp} EXP 남았어요.`}
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-sm text-gray-600">친밀도</p>

              <p className="mt-1 text-2xl font-bold text-[#E07A5F]">
                {dino.affinity}%
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-[#E8F2EC] p-4">
              <p className="text-sm font-bold text-[#5F8C74]">성장 안내</p>

              <p className="mt-2 text-sm text-gray-600">
                현재 디노는 {dino.templateName}이며, {dinoStageLabel} 단계로
                표시되고 있어요.
              </p>

              <p className="mt-2 text-sm text-gray-600">
                오늘의 미션을 완료하면 EXP가 쌓이고, EXP가 충분히 모이면 다음
                성장 단계로 넘어갈 수 있어요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEvolutionOpen(true)}
              className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
            >
              🎉 진화 확인하기
            </button>

            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="mt-3 w-full rounded-2xl border border-[#5F8C74] py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              🦖 디노 카드 자랑하기
            </button>
          </aside>
        </section>
      </section>

      {isShareOpen && (
        <DinoCardShareModal
          nickname={dino.nickname}
          dinoType={dinoType}
          dinoStage={dinoStage}
          templateName={dino.templateName}
          savedCarbonKg={0}
          guildName="해운대 에코 길드"
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {isEvolutionOpen && (
        <DinoEvolutionModal
          nickname={dino.nickname}
          dinoType={dinoType}
          prevStage={prevStage}
          newStage={dinoStage}
          onClose={() => setIsEvolutionOpen(false)}
        />
      )}
    </main>
  );
}
