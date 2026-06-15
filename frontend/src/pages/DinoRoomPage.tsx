// src/pages/DinoRoomPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyDino, type MyDinoResponse } from "../api/dinoApi";

import {
  dinoImagesByType,
  type DinoStage,
  type DinoType,
} from "../assets/images/dinos/dinoImages";

// 디노룸 배경 이미지입니다.
// 파일 위치: src/assets/images/dinos/dino-room-bg.png
import dinoRoomBg from "../assets/images/dinos/dino-room-bg.png";

// 백엔드에서 받은 templateCode를 프론트 이미지 타입으로 안전하게 바꿔주는 함수입니다.
// 프론트 이미지는 TYRANO / SAURO / CERATO만 알고 있습니다.
// 그런데 백엔드나 DB에서는 BRACHIO / TRICERA 같은 이름이 올 수도 있어서 안전 변환이 필요합니다.
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

// 백엔드에서 받은 stage를 프론트 이미지 단계로 안전하게 바꿔주는 함수입니다.
// 프론트 이미지는 EGG / HATCHLING / JUVENILE / ADULT 단계만 알고 있습니다.
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

export function DinoRoomPage() {
  // 페이지 이동을 도와주는 함수입니다.
  const navigate = useNavigate();

  // 백엔드에서 받아온 내 공룡 정보입니다.
  const [dino, setDino] = useState<MyDinoResponse | null>(null);

  // 로딩 중인지 저장합니다.
  const [isLoading, setIsLoading] = useState(true);

  // 에러 메시지입니다.
  const [errorMessage, setErrorMessage] = useState("");

  // 공룡 아래에 보여줄 말풍선 문구입니다.
  const [message, setMessage] = useState("공룡을 클릭해보세요!");

  // 공룡이 기뻐하는 상태인지 저장합니다.
  const [isHappy, setIsHappy] = useState(false);

  // 페이지가 처음 열릴 때 내 공룡 정보를 백엔드에서 가져옵니다.
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

  // 로딩 중일 때 보여줄 화면입니다.
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

  // 에러가 났거나 공룡 정보가 없을 때 보여줄 화면입니다.
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

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-5 rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            홈으로 가기
          </button>
        </div>
      </main>
    );
  }

  // 백엔드에서 받은 공룡 타입과 성장 단계를 프론트 이미지용 값으로 안전하게 바꿉니다.
  const dinoType = getSafeDinoType(dino);
  const dinoStage = getSafeDinoStage(dino.stage);

  // EXP 진행률을 계산합니다.
  // nextStageExp가 0이거나 없으면 나누기 오류가 날 수 있으므로 1로 방어합니다.
  const nextStageExp = dino.nextStageExp > 0 ? dino.nextStageExp : 1;
  const expPercent = Math.min((dino.exp / nextStageExp) * 100, 100);

  // 현재 화면에 보여줄 공룡 이미지입니다.
  const currentDinoImage = dinoImagesByType[dinoType][dinoStage];

  // 공룡을 클릭했을 때 실행됩니다.
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
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* 디노룸 배경 + 공룡 영역 */}
          <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div
              className="relative flex items-end justify-center bg-cover bg-center"
              style={{
                backgroundImage: `url(${dinoRoomBg})`,
                minHeight: "520px",
              }}
            >
              {/* 말풍선 */}
              <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-[#5F8C74] shadow-sm">
                {message}
              </div>

              {/* 공룡 */}
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

          {/* 공룡 정보 카드 */}
          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">MY DINO</p>

            <h2 className="mt-2 text-2xl font-bold">{dino.nickname}</h2>

            <p className="mt-1 text-sm text-gray-600">
              종류: {dino.templateName}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              현재 성장 단계: {dino.stage}
            </p>

            {/* EXP */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>EXP</span>
                <span>
                  {dino.exp} / {dino.nextStageExp}
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-[#E8F2EC]">
                <div
                  className="h-full rounded-full bg-[#5F8C74]"
                  style={{ width: `${expPercent}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                미션을 완료하면 EXP가 올라가고 성장 단계가 바뀔 수 있어요.
              </p>
            </div>

            {/* 친밀도 */}
            <div className="mt-6 rounded-2xl bg-[#FAF9F5] p-4">
              <p className="text-sm text-gray-600">친밀도</p>

              <p className="mt-1 text-2xl font-bold text-[#E07A5F]">
                {dino.affinity}%
              </p>
            </div>

            {/* 성장 안내 */}
            <div className="mt-4 rounded-2xl bg-[#E8F2EC] p-4">
              <p className="text-sm font-bold text-[#5F8C74]">성장 안내</p>

              <p className="mt-2 text-sm text-gray-600">
                오늘의 미션을 완료하면 EXP가 쌓이고, EXP가 충분히 모이면 디노가
                다음 단계로 성장할 수 있어요.
              </p>

              <p className="mt-2 text-sm text-gray-600">
                현재 이미지 타입: {dinoType} / 현재 이미지 단계: {dinoStage}
              </p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
