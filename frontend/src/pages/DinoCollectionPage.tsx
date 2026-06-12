// src/pages/DinoCollectionPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyDinoCollection, type DinoCollectionItem } from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

function getSafeDinoType(item: DinoCollectionItem): DinoType {
  const templateCode = String(item.templateCode ?? "");
  const templateName = String(item.templateName ?? "");

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
    templateName.includes("BRACHIO")
  ) {
    return "SAURO";
  }

  if (
    templateName.includes("각룡") ||
    templateName.includes("트리케라") ||
    templateName.includes("TRICERA")
  ) {
    return "CERATO";
  }

  return "TYRANO";
}

function getSafeDinoStage(item: DinoCollectionItem): DinoStage {
  const stage = String(item.stage ?? "");

  if (stage === "EGG") {
    return "EGG";
  }

  if (stage === "HATCHLING") {
    return "HATCHLING";
  }

  if (stage === "JUVENILE") {
    return "JUVENILE";
  }

  if (stage === "ADULT") {
    return "ADULT";
  }

  return "EGG";
}

function getDinoDisplayName(item: DinoCollectionItem) {
  return item.templateName ?? item.nickname ?? "이름 없는 디노";
}

function isOwnedDino(item: DinoCollectionItem) {
  return (
    item.owned === true || item.acquired === true || item.dinoId !== undefined
  );
}

export function DinoCollectionPage() {
  const navigate = useNavigate();

  const [collection, setCollection] = useState<DinoCollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMyDinoCollection();

        setCollection(data);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "공룡 도감 정보를 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, []);

  const ownedCount = collection.filter(isOwnedDino).length;
  const totalCount = collection.length;

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">DINO COLLECTION</p>

            <h1 className="mt-2 text-3xl font-bold">디노 도감</h1>

            <p className="mt-2 text-sm text-gray-600">
              내가 만난 공룡들을 모아볼 수 있는 도감이에요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dino-room")}
            className="rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
          >
            디노룸으로 이동
          </button>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">보유한 디노</p>
            <p className="mt-2 text-3xl font-bold text-[#5F8C74]">
              {ownedCount}마리
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">전체 도감</p>
            <p className="mt-2 text-3xl font-bold text-[#2C3531]">
              {totalCount}마리
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">수집률</p>
            <p className="mt-2 text-3xl font-bold text-[#E07A5F]">
              {totalCount === 0
                ? 0
                : Math.round((ownedCount / totalCount) * 100)}
              %
            </p>
          </div>
        </section>

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

        {!isLoading && !errorMessage && collection.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            아직 도감에 등록된 공룡이 없습니다.
          </div>
        )}

        {!isLoading && !errorMessage && collection.length > 0 && (
          <section className="grid gap-4 md:grid-cols-3">
            {collection.map((item, index) => {
              const dinoType = getSafeDinoType(item);
              const dinoStage = getSafeDinoStage(item);
              const owned = isOwnedDino(item);

              return (
                <article
                  key={`${item.templateCode ?? "dino"}-${item.dinoId ?? index}`}
                  className={[
                    "rounded-3xl bg-white p-5 shadow-sm transition",
                    owned ? "" : "opacity-60 grayscale",
                  ].join(" ")}
                >
                  <div className="flex h-56 items-center justify-center rounded-3xl bg-[#E8F2EC]">
                    <img
                      src={dinoImagesByType[dinoType][dinoStage]}
                      alt={`${getDinoDisplayName(item)} 이미지`}
                      className="h-44 object-contain"
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xl font-bold">
                        {owned ? getDinoDisplayName(item) : "??? 디노"}
                      </h2>

                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-bold",
                          owned
                            ? "bg-[#5F8C74] text-white"
                            : "bg-gray-200 text-gray-500",
                        ].join(" ")}
                      >
                        {owned ? "보유중" : "미보유"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      타입: {dinoType}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      성장 단계: {dinoStage}
                    </p>

                    {item.nickname && (
                      <p className="mt-1 text-sm text-gray-600">
                        별명: {item.nickname}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}
