// src/pages/DinoCollectionPage.tsx

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header";

=======
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

>>>>>>> feature/community-fe-setup
import {
  getMyDinoCollection,
  type DinoCollectionResponse,
} from "../api/dinoApi";

import {
  dinoImagesByType,
<<<<<<< HEAD
  type DinoStage,
=======
>>>>>>> feature/community-fe-setup
  type DinoType,
} from "../assets/images/dinos/dinoImages";

/*
<<<<<<< HEAD
  이 페이지에서 하는 일

  1. GET /api/me/dino/collection API를 호출합니다.
  2. 백엔드가 내려준 공룡 종류별 해금 여부를 보여줍니다.
  3. unlocked가 true면 "해금됨"으로 표시합니다.
  4. unlocked가 false면 "잠김"으로 표시하고 해금 조건을 보여줍니다.
  5. 현재는 API가 공룡 종류 단위로 내려오므로 성장 단계별 도감이 아니라 종류 도감으로 표시합니다.
*/

=======
  이 파일에서 하는 일

  1. GET /api/me/dino/collection API로 내 디노도감 정보를 불러옵니다.
  2. 백엔드에서 받은 unlockedCount, totalCount, dinos를 화면에 보여줍니다.
  3. 해금된 공룡은 밝게 보여주고, 잠긴 공룡은 흐리게 보여줍니다.
  4. 아직 해금되지 않은 공룡은 unlockCondition을 보여줍니다.
*/

/* =========================
   공룡 templateId → 프론트 이미지 타입 변환
   ========================= */

>>>>>>> feature/community-fe-setup
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

<<<<<<< HEAD
function getDisplayStage(unlocked: boolean): DinoStage {
  return unlocked ? "HATCHLING" : "EGG";
}
=======
/* =========================
   날짜 표시 함수
   ========================= */
>>>>>>> feature/community-fe-setup

function formatDate(dateText: string | null) {
  if (!dateText) {
    return "-";
  }

<<<<<<< HEAD
  return dateText.slice(0, 10);
}

=======
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/* =========================
   디노도감 페이지
   ========================= */

>>>>>>> feature/community-fe-setup
export function DinoCollectionPage() {
  const navigate = useNavigate();

  const [collection, setCollection] = useState<DinoCollectionResponse | null>(
    null,
  );
<<<<<<< HEAD

=======
>>>>>>> feature/community-fe-setup
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

<<<<<<< HEAD
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
=======
  const progressPercent = useMemo(() => {
    if (!collection || collection.totalCount === 0) {
      return 0;
    }

    return Math.round((collection.unlockedCount / collection.totalCount) * 100);
  }, [collection]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-6 text-[#2C3531]">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">DINO COLLECTION</p>

          <h1 className="mt-2 text-xl font-bold">디노도감을 불러오는 중...</h1>

          <p className="mt-2 text-sm text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </main>
>>>>>>> feature/community-fe-setup
    );
  }

  if (errorMessage || !collection) {
    return (
<<<<<<< HEAD
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
=======
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-6 text-[#2C3531]">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-[#E07A5F]">ERROR</p>

          <h1 className="mt-2 text-xl font-bold">
            디노도감을 불러오지 못했어요
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            {errorMessage || "서버에서 도감 정보를 가져오지 못했습니다."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
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
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">DINO COLLECTION</p>

            <h1 className="mt-2 text-3xl font-bold">디노도감</h1>

            <p className="mt-2 text-sm text-gray-600">
              해금한 공룡과 아직 잠겨 있는 공룡의 조건을 확인해요.
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
              className="rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
            >
              홈으로 가기
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-[#5F8C74]">
                COLLECTION PROGRESS
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {collection.unlockedCount} / {collection.totalCount} 해금
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                미션 참여와 대시보드 활동을 통해 새로운 디노를 해금할 수 있어요.
              </p>
            </div>

            <div className="rounded-3xl bg-[#E8F2EC] px-6 py-4 text-center">
              <p className="text-sm font-bold text-[#5F8C74]">달성률</p>
              <p className="mt-1 text-3xl font-bold text-[#2C3531]">
                {progressPercent}%
              </p>
            </div>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#E8F2EC]">
            <div
              className="h-full rounded-full bg-[#5F8C74] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {collection.dinos.map((dino) => {
            const dinoType = getDinoTypeByTemplateId(dino.templateId);

            // 도감은 종 단위 화면이라 대표 이미지로 유아기 이미지를 사용합니다.
            // 잠긴 공룡도 어떤 종인지 살짝 보이게 하되 흐리게 표시합니다.
            const dinoImage = dinoImagesByType[dinoType].HATCHLING;
>>>>>>> feature/community-fe-setup

            return (
              <article
                key={dino.templateId}
<<<<<<< HEAD
                className={`rounded-3xl border p-5 shadow-sm transition ${
                  dino.unlocked
                    ? "border-[#E8F2EC] bg-white"
                    : "border-gray-100 bg-white opacity-75"
=======
                className={`flex min-h-[420px] flex-col rounded-3xl bg-white p-5 shadow-sm transition ${
                  dino.unlocked
                    ? "ring-1 ring-[#DCE9E1]"
                    : "opacity-75 grayscale"
>>>>>>> feature/community-fe-setup
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
<<<<<<< HEAD
                    <p className="text-xs font-bold tracking-wider text-[#5F8C74]">
                      TEMPLATE #{dino.templateId}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">{dino.name}</h2>
=======
                    <p className="text-sm font-bold text-[#5F8C74]">
                      TEMPLATE #{dino.templateId}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">{dino.name}</h2>
>>>>>>> feature/community-fe-setup
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      dino.unlocked
                        ? "bg-[#E8F2EC] text-[#5F8C74]"
<<<<<<< HEAD
                        : "bg-gray-100 text-gray-500"
=======
                        : "bg-[#FFF0EA] text-[#E07A5F]"
>>>>>>> feature/community-fe-setup
                    }`}
                  >
                    {dino.unlocked ? "해금됨" : "잠김"}
                  </span>
                </div>

<<<<<<< HEAD
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
=======
                <div className="mt-5 flex h-44 items-center justify-center rounded-3xl bg-[#FAF9F5]">
                  <img
                    src={dinoImage}
                    alt={`${dino.name} 이미지`}
                    className={`h-36 object-contain drop-shadow ${
                      dino.unlocked ? "" : "opacity-40"
                    }`}
                  />
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  {dino.unlocked ? (
                    <>
                      <div className="rounded-2xl bg-[#E8F2EC] p-4">
                        <p className="font-bold text-[#5F8C74]">첫 해금 날짜</p>

                        <p className="mt-1 text-gray-700">
                          {formatDate(dino.firstHatchedAt)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#FAF9F5] p-4">
                        <p className="font-bold text-[#2C3531]">
                          누적 탄소 절감량
                        </p>

                        <p className="mt-1 text-gray-700">
                          {dino.totalCarbonKg ?? 0} kgCO₂e
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-[#FFF0EA] p-4">
                      <p className="font-bold text-[#E07A5F]">해금 조건</p>

                      <p className="mt-2 leading-relaxed text-gray-700">
                        {dino.unlockCondition ?? "해금 조건 준비 중입니다."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-5">
                  {dino.unlocked ? (
                    <button
                      type="button"
                      onClick={() => navigate("/dino-room")}
                      className="w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
                    >
                      내 디노룸에서 보기
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate("/missions")}
                      className="w-full rounded-2xl border border-[#E07A5F] py-3 text-sm font-bold text-[#E07A5F] transition hover:bg-[#FFF0EA]"
                    >
                      미션 하러 가기
                    </button>
                  )}
>>>>>>> feature/community-fe-setup
                </div>
              </article>
            );
          })}
        </section>

<<<<<<< HEAD
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
=======
        <p className="mt-6 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm">
          디노도감은 공룡 종 단위로 해금 상태를 보여줍니다. 브라키오는 자원순환
          미션 완료 횟수, 트리케라는 에너지 대시보드 스냅샷 생성 횟수와
          연결됩니다.
        </p>
      </section>
    </main>
>>>>>>> feature/community-fe-setup
  );
}
