// src/pages/DinoGrowthComparePage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyDino, type MyDinoResponse } from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

/* =========================
   공룡 타입 안전 변환 함수
   ========================= */

function getSafeDinoType(dino: MyDinoResponse): DinoType {
  const templateCode = String(dino.templateCode ?? "").toUpperCase();
  const templateName = String(dino.templateName ?? "").toUpperCase();

  if (templateCode === "TYRANO") return "TYRANO";
  if (templateCode === "SAURO" || templateCode === "BRACHIO") return "SAURO";
  if (templateCode === "CERATO" || templateCode === "TRICERA") return "CERATO";
  if (templateName.includes("티라노") || templateName.includes("TYRANO"))
    return "TYRANO";
  if (
    templateName.includes("용각") ||
    templateName.includes("브라키오") ||
    templateName.includes("BRACHIO") ||
    templateName.includes("SAURO")
  )
    return "SAURO";
  if (
    templateName.includes("각룡") ||
    templateName.includes("트리케라") ||
    templateName.includes("TRICERA") ||
    templateName.includes("CERATO")
  )
    return "CERATO";

  return "TYRANO";
}

/* =========================
   성장 단계 안전 변환 함수
   ========================= */

function getSafeDinoStage(stage?: string | null): DinoStage {
  const safeStage = String(stage ?? "").toUpperCase();
  if (safeStage === "EGG") return "EGG";
  if (safeStage === "HATCHLING") return "HATCHLING";
  if (safeStage === "JUVENILE") return "JUVENILE";
  if (safeStage === "ADULT") return "ADULT";
  return "EGG";
}

/* =========================
   단계 관련 상수
   ========================= */

const stageOrder: DinoStage[] = ["EGG", "HATCHLING", "JUVENILE", "ADULT"];

const stageLabels: Record<DinoStage, string> = {
  EGG: "알",
  HATCHLING: "유아기",
  JUVENILE: "청소년기",
  ADULT: "성룡",
};

const stageDescriptions: Record<DinoStage, string> = {
  EGG: "아직 알 속에서 세상을 기다리는 단계예요.",
  HATCHLING: "막 깨어나 호기심이 많은 유아기 단계예요.",
  JUVENILE: "미션을 통해 빠르게 성장하는 청소년기 단계예요.",
  ADULT: "탄소 절감 경험을 충분히 쌓은 성룡 단계예요.",
};

/* =========================
   성장 비교 페이지
   ========================= */

export function DinoGrowthComparePage() {
  const navigate = useNavigate();

  const [dino, setDino] = useState<MyDinoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMyDino = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMyDino();
        setDino(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("내 디노 정보를 불러오지 못했습니다.");
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
          <p className="text-sm font-bold text-[#5F8C74]">DINO GROWTH</p>
          <p className="mt-2 text-lg font-bold">성장 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !dino) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-6 text-[#2C3531]">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#E07A5F]">ERROR</p>
          <h1 className="mt-2 text-xl font-bold">정보를 불러오지 못했어요</h1>
          <button
            type="button"
            onClick={() => navigate("/dino-room")}
            className="mt-5 rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
          >
            디노룸으로 가기
          </button>
        </div>
      </main>
    );
  }

  const dinoType = getSafeDinoType(dino);
  const currentStage = getSafeDinoStage(dino.stage);
  const currentStageIndex = stageOrder.indexOf(currentStage);

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">DINO GROWTH</p>

            <h1 className="mt-2 text-3xl font-bold">내 공룡 성장 비교</h1>

            <p className="mt-2 text-sm text-gray-600">
              오늘 하루 미션 달성률 {dino.exp} / {dino.nextStageExp ?? "MAX"}{" "}
              EXP
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/dino-room")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              디노룸으로 가기
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              홈으로 가기
            </button>
          </div>
        </header>

        {/* 성장 단계 카드 3개 */}
        <section className="grid gap-4 md:grid-cols-3">
          {stageOrder.map((stage, index) => {
            const isCurrent = stage === currentStage;
            const isOwned = index <= currentStageIndex;
            const isNext = index === currentStageIndex + 1;
            const image = dinoImagesByType[dinoType][stage];

            return (
              <article
                key={stage}
                className={`rounded-3xl p-5 shadow-sm transition ${
                  isCurrent
                    ? "bg-[#E8F2EC] ring-2 ring-[#5F8C74]"
                    : isNext
                      ? "bg-[#FFF0EA] ring-2 ring-[#E07A5F]"
                      : isOwned
                        ? "bg-white"
                        : "bg-white opacity-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-gray-500">
                      {index + 1}단계
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      {stageLabels[stage]}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      isCurrent
                        ? "bg-[#5F8C74] text-white"
                        : isNext
                          ? "bg-[#E07A5F] text-white"
                          : isOwned
                            ? "bg-gray-100 text-gray-500"
                            : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCurrent
                      ? "현재"
                      : isNext
                        ? "다음 목표"
                        : isOwned
                          ? "달성"
                          : "미달성"}
                  </span>
                </div>

                <div className="mt-4 flex h-36 items-center justify-center rounded-2xl bg-[#FAF9F5]">
                  <img
                    src={image}
                    alt={`${stageLabels[stage]} 단계 공룡`}
                    className={`h-28 object-contain ${
                      !isOwned && !isNext ? "opacity-30 grayscale" : ""
                    }`}
                  />
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  {stageDescriptions[stage]}
                </p>
              </article>
            );
          })}
        </section>

        {/* 미션 안내 */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">GROWTH GUIDE</p>

          <h2 className="mt-2 text-xl font-bold">
            {currentStage === "ADULT"
              ? "최종 단계에 도달했어요! 🎉"
              : `${stageLabels[stageOrder[currentStageIndex + 1]]} 단계까지 함께 가요`}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {currentStage === "ADULT"
              ? "성룡으로 성장한 디노와 함께 탄소 절감을 이어나가요."
              : "오늘의 미션을 완료하면 EXP가 쌓이고, 다음 단계로 진화할 수 있어요."}
          </p>

          {currentStage !== "ADULT" && (
            <button
              type="button"
              onClick={() => navigate("/missions")}
              className="mt-4 w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
            >
              미션 하러 가기
            </button>
          )}
        </section>
      </section>
    </main>
  );
}
