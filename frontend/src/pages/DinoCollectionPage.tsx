// src/pages/DinoCollectionPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyDino, type MyDinoResponse } from "../api/dinoApi";
import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

type CollectionCard = {
  type: DinoType;
  stage: DinoStage;
  title: string;
  description: string;
};

const stageOrder: DinoStage[] = ["EGG", "HATCHLING", "JUVENILE", "ADULT"];

const typeOrder: DinoType[] = ["TYRANO", "SAURO", "CERATO"];

// 현재 백엔드에는 도감 전체 API가 없으므로,
// 프론트에서 보여줄 도감 카드 목록을 직접 준비합니다.
const collectionCards: CollectionCard[] = [
  {
    type: "TYRANO",
    stage: "EGG",
    title: "티라노 알",
    description: "아직 깨어나기 전의 티라노 알입니다.",
  },
  {
    type: "TYRANO",
    stage: "HATCHLING",
    title: "티라노 유아기",
    description: "막 태어난 티라노입니다.",
  },
  {
    type: "TYRANO",
    stage: "JUVENILE",
    title: "티라노 청소년기",
    description: "씩씩하게 자라고 있는 티라노입니다.",
  },
  {
    type: "TYRANO",
    stage: "ADULT",
    title: "티라노 성룡",
    description: "완전히 성장한 티라노입니다.",
  },

  {
    type: "SAURO",
    stage: "EGG",
    title: "용각류 알",
    description: "아직 깨어나기 전의 용각류 알입니다.",
  },
  {
    type: "SAURO",
    stage: "HATCHLING",
    title: "용각류 유아기",
    description: "순하게 자라는 용각류입니다.",
  },
  {
    type: "SAURO",
    stage: "JUVENILE",
    title: "용각류 청소년기",
    description: "목이 길게 자라기 시작한 용각류입니다.",
  },
  {
    type: "SAURO",
    stage: "ADULT",
    title: "용각류 성룡",
    description: "커다랗고 듬직하게 성장한 용각류입니다.",
  },

  {
    type: "CERATO",
    stage: "EGG",
    title: "각룡 알",
    description: "아직 깨어나기 전의 각룡 알입니다.",
  },
  {
    type: "CERATO",
    stage: "HATCHLING",
    title: "각룡 유아기",
    description: "작고 단단한 각룡입니다.",
  },
  {
    type: "CERATO",
    stage: "JUVENILE",
    title: "각룡 청소년기",
    description: "뿔이 조금씩 자라나는 각룡입니다.",
  },
  {
    type: "CERATO",
    stage: "ADULT",
    title: "각룡 성룡",
    description: "튼튼하게 성장한 각룡입니다.",
  },
];

function getSafeDinoType(dino: MyDinoResponse | null): DinoType {
  const templateCode = String(dino?.templateCode ?? "").toUpperCase();
  const templateName = String(dino?.templateName ?? "").toUpperCase();

  if (templateCode.includes("TYRANO") || templateName.includes("TYRANO")) {
    return "TYRANO";
  }

  if (
    templateCode.includes("SAURO") ||
    templateCode.includes("BRACHIO") ||
    templateName.includes("SAURO") ||
    templateName.includes("BRACHIO") ||
    templateName.includes("용각")
  ) {
    return "SAURO";
  }

  if (
    templateCode.includes("CERATO") ||
    templateCode.includes("TRICERA") ||
    templateName.includes("CERATO") ||
    templateName.includes("TRICERA") ||
    templateName.includes("각룡")
  ) {
    return "CERATO";
  }

  return "TYRANO";
}

function getSafeDinoStage(stage?: string | null): DinoStage {
  const safeStage = String(stage ?? "").toUpperCase();

  if (safeStage === "EGG") return "EGG";
  if (safeStage === "HATCHLING") return "HATCHLING";
  if (safeStage === "JUVENILE") return "JUVENILE";
  if (safeStage === "ADULT") return "ADULT";

  return "EGG";
}

// 현재 내 공룡이 특정 도감 카드를 보유한 상태인지 확인합니다.
// 예: 내 공룡이 SAURO / HATCHLING 이면
// SAURO / EGG       → 보유 중
// SAURO / HATCHLING → 보유 중
// SAURO / JUVENILE  → 미보유
// SAURO / ADULT     → 미보유
function isOwnedCard(
  card: CollectionCard,
  myDinoType: DinoType,
  myDinoStage: DinoStage,
) {
  if (card.type !== myDinoType) {
    return false;
  }

  const cardStageIndex = stageOrder.indexOf(card.stage);
  const myStageIndex = stageOrder.indexOf(myDinoStage);

  return cardStageIndex <= myStageIndex;
}

// 정렬 규칙:
// 1. 내가 키우는 공룡 타입 전체를 먼저 보여줍니다.
// 2. 같은 타입 안에서는 EGG → HATCHLING → JUVENILE → ADULT 순서로 보여줍니다.
// 3. 나머지 공룡은 TYRANO → SAURO → CERATO 순서로 보여줍니다.
function sortCollectionCards(cards: CollectionCard[], myDinoType: DinoType) {
  return [...cards].sort((a, b) => {
    const aIsMyType = a.type === myDinoType;
    const bIsMyType = b.type === myDinoType;

    if (aIsMyType && !bIsMyType) return -1;
    if (!aIsMyType && bIsMyType) return 1;

    if (a.type === b.type) {
      return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
    }

    return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  });
}

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

        const message =
          error instanceof Error
            ? error.message
            : "디노 정보를 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyDino();
  }, []);

  const myDinoType = getSafeDinoType(myDino);
  const myDinoStage = getSafeDinoStage(myDino?.stage);

  const sortedCards = sortCollectionCards(collectionCards, myDinoType);

  const ownedCount = sortedCards.filter((card) =>
    isOwnedCard(card, myDinoType, myDinoStage),
  ).length;

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">DINO COLLECTION</p>

            <h1 className="mt-2 text-3xl font-bold">디노 도감</h1>

            <p className="mt-2 text-sm text-gray-600">
              내가 키우고 있는 디노와 앞으로 만날 수 있는 디노들을 확인해요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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

        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            디노 도감을 불러오는 중입니다...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <>
            <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#5F8C74]">MY DINO</p>

              <h2 className="mt-2 text-2xl font-bold">
                {myDino?.nickname ?? "이름 없는 디노"}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                타입: {myDinoType} / 성장 단계: {myDinoStage}
              </p>

              <p className="mt-2 text-sm font-bold text-[#5F8C74]">
                보유 도감: {ownedCount} / {collectionCards.length}
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sortedCards.map((card) => {
                const isOwned = isOwnedCard(card, myDinoType, myDinoStage);
                const image = dinoImagesByType[card.type][card.stage];

                return (
                  <article
                    key={`${card.type}-${card.stage}`}
                    className={`rounded-3xl p-5 shadow-sm transition ${
                      isOwned ? "bg-[#E8F2EC]" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-center">
                      <img
                        src={image}
                        alt={card.title}
                        className="h-36 w-36 object-contain"
                      />
                    </div>

                    <div className="mt-4">
                      <p
                        className={`text-xs font-bold ${
                          isOwned ? "text-[#5F8C74]" : "text-gray-400"
                        }`}
                      >
                        {isOwned ? "보유 중" : "미보유"}
                      </p>

                      <h2 className="mt-1 text-lg font-bold">{card.title}</h2>

                      <p className="mt-2 text-sm text-gray-600">
                        {card.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
