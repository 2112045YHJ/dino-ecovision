// src/pages/DinoCollectionPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";

import {
  getMyDinoCollection,
  type DinoCollectionResponse,
} from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

/*
  이 페이지에서 하는 일

  1. GET /api/me/dino/collection API를 호출합니다.
  2. 백엔드가 내려준 공룡 종류별 해금 여부를 보여줍니다.
  3. unlocked가 true면 "해금됨"으로 표시합니다.
  4. unlocked가 false면 "잠김"으로 표시하고 해금 조건을 보여줍니다.
  5. 현재는 API가 공룡 종류 단위로 내려오므로 성장 단계별 도감이 아니라 종류 도감으로 표시합니다.
*/

function getDinoTypeByTemplateId(templateId: number): DinoType {
  if (templateId === 1) {
    return "TYRANO";
  }

  if (templateId === 2) {
    return "SAURO";
  }

  if (templateId === 3) {
    return "CERATO";
  }

  return "TYRANO";
}

function getDisplayStage(unlocked: boolean): DinoStage {
  return unlocked ? "HATCHLING" : "EGG";
}

function formatDate(dateText: string | null) {
  if (!dateText) {
    return "-";
  }

  return dateText.slice(0, 10);
}

export function DinoCollectionPage() {
  const navigate = useNavigate();

  const [collection, setCollection] = useState<DinoCollectionResponse | null>(
    null,
  );

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
            : "디노도감 정보를 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
        <Header />

        <main className="mx-auto flex max-w-4xl items-center justify-center p-6">
          <div className="rounded-3xl border border-[#E8F2EC] bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">DINO COLLECTION</p>

            <p className="mt-2 text-lg font-bold">디노도감을 불러오는 중...</p>
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage || !collection) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
        <Header />

        <main className="mx-auto flex max-w-4xl items-center justify-center p-6">
          <div className="rounded-3xl border border-[#E8F2EC] bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-[#E07A5F]">ERROR</p>

            <h1 className="mt-2 text-xl font-bold">
              디노도감을 불러오지 못했어요
            </h1>

            <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>

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
                onClick={() => navigate("/dino-room")}
                className="rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
              >
                디노룸으로 가기
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const lockedCount = collection.totalCount - collection.unlockedCount;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C3531]">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">DINO COLLECTION</p>

          <h1 className="mt-1 text-3xl font-bold">디노 도감</h1>

          <p className="mt-1 text-sm text-gray-600">
            내가 해금한 공룡 종류와 아직 잠겨 있는 공룡의 해금 조건을 확인할 수
            있어요.
          </p>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              UNLOCKED
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {collection.unlockedCount} / {collection.totalCount}
            </h2>

            <p className="mt-1 text-sm text-gray-500">해금한 디노 종류</p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              LOCKED
            </p>

            <h2 className="mt-2 text-2xl font-bold">{lockedCount}</h2>

            <p className="mt-1 text-sm text-gray-500">
              아직 해금되지 않은 디노
            </p>
          </article>

          <article className="rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
              GUIDE
            </p>

            <h2 className="mt-2 text-lg font-bold">해금 조건 확인</h2>

            <p className="mt-1 text-sm text-gray-500">
              조건을 달성하면 새로운 디노가 도감에 열려요.
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {collection.dinos.map((dino) => {
            const dinoType = getDinoTypeByTemplateId(dino.templateId);
            const displayStage = getDisplayStage(dino.unlocked);
            const dinoImage = dinoImagesByType[dinoType][displayStage];

            return (
              <article
                key={dino.templateId}
                className={`rounded-3xl border p-5 shadow-sm transition ${
                  dino.unlocked
                    ? "border-[#E8F2EC] bg-white"
                    : "border-gray-100 bg-white opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
                      TEMPLATE #{dino.templateId}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">{dino.name}</h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      dino.unlocked
                        ? "bg-[#E8F2EC] text-[#5F8C74]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {dino.unlocked ? "해금됨" : "잠김"}
                  </span>
                </div>

                <div className="mt-4 flex h-40 items-center justify-center rounded-3xl bg-[#E8F2EC]">
                  <img
                    src={dinoImage}
                    alt={`${dino.name} 이미지`}
                    className="h-32 object-contain"
                  />
                </div>

                <div className="mt-4 rounded-2xl bg-[#FAF9F5] p-4">
                  <p className="text-xs font-bold text-[#5F8C74]">해금 조건</p>

                  <p className="mt-2 text-sm text-gray-600">
                    {dino.unlockCondition}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between gap-3">
                    <span>최초 부화일</span>
                    <span className="font-bold">
                      {formatDate(dino.firstHatchedAt)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>누적 절감량</span>
                    <span className="font-bold">
                      {dino.totalCarbonKg === null
                        ? "-"
                        : `${dino.totalCarbonKg} kg`}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 rounded-3xl border border-[#E8F2EC] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
            API INFO
          </p>

          <p className="mt-2 text-sm text-gray-600">
            이 화면은 `GET /api/me/dino/collection` 응답 기준으로 구성되어
            있습니다. 현재 트리케라 해금 조건은 에너지 대시보드 스냅샷 기능과
            연결 예정이므로 백엔드 작업 완료 후 실제 해금 여부가 반영됩니다.
          </p>
        </section>
      </main>
    </div>
  );
}
