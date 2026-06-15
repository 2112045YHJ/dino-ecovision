// src/pages/DinoCollectionPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyDino, type MyDinoResponse } from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

/*
  이 파일에서 하는 일

  1. 별도 도감 API가 아직 없기 때문에 GET /api/me/dino만 사용합니다.
  2. 현재 내 디노 타입과 성장 단계를 기준으로 도감을 보여줍니다.
  3. 현재 성장 단계까지는 "보유 중"으로 표시합니다.
  4. 현재 내 디노 카드에는 "현재 내 디노" 뱃지를 표시합니다.
  5. 내가 키우는 공룡 타입이 도감 상단에 먼저 나오도록 정렬합니다.
*/

type DinoCollectionCard = {
  type: DinoType;
  stage: DinoStage;
  typeLabel: string;
  stageLabel: string;
  description: string;
};

const typeOrder: DinoType[] = ["TYRANO", "SAURO", "CERATO"];
const stageOrder: DinoStage[] = ["EGG", "HATCHLING", "JUVENILE", "ADULT"];

const typeLabels: Record<DinoType, string> = {
  TYRANO: "티라노",
  SAURO: "용각류",
  CERATO: "각룡류",
};

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

const collectionCards: DinoCollectionCard[] = typeOrder.flatMap((type) =>
  stageOrder.map((stage) => ({
    type,
    stage,
    typeLabel: typeLabels[type],
    stageLabel: stageLabels[stage],
    description: stageDescriptions[stage],
  })),
);

/* =========================
   공룡 타입 안전 변환 함수
   ========================= */

function getSafeDinoType(dino?: MyDinoResponse | null): DinoType {
  const templateCode = String(dino?.templateCode ?? "").toUpperCase();
  const templateName = String(dino?.templateName ?? "").toUpperCase();

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
   보유 여부 판단 함수
   ========================= */

function getStageIndex(stage: DinoStage) {
  return stageOrder.indexOf(stage);
}

function isOwnedCard(
  card: DinoCollectionCard,
  myDinoType: DinoType | null,
  myDinoStage: DinoStage | null,
) {
  if (!myDinoType || !myDinoStage) {
    return false;
  }

  if (card.type !== myDinoType) {
    return false;
  }

  return getStageIndex(card.stage) <= getStageIndex(myDinoStage);
}

/* =========================
   정렬 함수
   ========================= */

function sortCollectionCards(
  cards: DinoCollectionCard[],
  myDinoType: DinoType | null,
) {
  return [...cards].sort((a, b) => {
    if (myDinoType) {
      if (a.type === myDinoType && b.type !== myDinoType) {
        return -1;
      }

      if (a.type !== myDinoType && b.type === myDinoType) {
        return 1;
      }
    }

    const typeDiff = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);

    if (typeDiff !== 0) {
      return typeDiff;
    }

    return getStageIndex(a.stage) - getStageIndex(b.stage);
  });
}

/* =========================
   디노도감 페이지
   ========================= */

export function DinoCollectionPage() {
  const navigate = useNavigate();

  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMyDino = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMyDino();

        setMyDino(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("내 디노 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyDino();
  }, []);

  const myDinoType = myDino ? getSafeDinoType(myDino) : null;
  const myDinoStage = myDino ? getSafeDinoStage(myDino.stage) : null;

  const sortedCards = useMemo(
    () => sortCollectionCards(collectionCards, myDinoType),
    [myDinoType],
  );

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-6 text-[#2C3531]">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">DINO COLLECTION</p>
          <p className="mt-2 text-lg font-bold">디노도감을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !myDino) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-6 text-[#2C3531]">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#E07A5F]">ERROR</p>

          <h1 className="mt-2 text-xl font-bold">
            디노도감을 불러오지 못했어요
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

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="md:flex-1">
            <p className="text-sm font-bold text-[#5F8C74]">DINO COLLECTION</p>

            <h1 className="mt-2 text-3xl font-bold">디노 도감</h1>

            <p className="mt-2 text-sm text-gray-600">
              현재 보유 디노 기준으로 성장 기록과 앞으로 만날 수 있는 디노를
              확인해요.
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
              onClick={() => navigate("/dino-room")}
              className="rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
            >
              디노룸으로 가기
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">MY DINO</p>

          <h2 className="mt-2 text-xl font-bold">{myDino.nickname}</h2>

          <p className="mt-2 text-sm text-gray-600">
            현재 내 디노는 {myDino.templateName}이며,{" "}
            {myDinoStage ? stageLabels[myDinoStage] : "알"} 단계예요.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sortedCards.map((card) => {
            const isOwned = isOwnedCard(card, myDinoType, myDinoStage);

            const isCurrentDino =
              myDinoType === card.type && myDinoStage === card.stage;

            const image = dinoImagesByType[card.type][card.stage];

            return (
              <article
                key={`${card.type}-${card.stage}`}
                className={`rounded-3xl p-5 shadow-sm transition ${
                  isCurrentDino
                    ? "bg-[#FFF0EA] ring-2 ring-[#E07A5F]"
                    : isOwned
                      ? "bg-[#E8F2EC]"
                      : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#5F8C74]">
                      {card.typeLabel}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {card.stageLabel}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      isCurrentDino
                        ? "bg-[#E07A5F] text-white"
                        : isOwned
                          ? "bg-[#5F8C74] text-white"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isCurrentDino
                      ? "현재 내 디노"
                      : isOwned
                        ? "보유 중"
                        : "미보유"}
                  </span>
                </div>

                <div className="mt-4 flex h-40 items-center justify-center rounded-3xl bg-[#FAF9F5]">
                  <img
                    src={image}
                    alt={`${card.typeLabel} ${card.stageLabel}`}
                    className="h-32 object-contain"
                  />
                </div>

                <p className="mt-4 text-sm text-gray-600">{card.description}</p>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
