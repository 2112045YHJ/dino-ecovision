// src/pages/MyPageMainPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMe, type MeResponse } from "../api/userApi";
import { getMyDino, type MyDinoResponse } from "../api/dinoApi";
import { getTodayMissions } from "../api/missionApi";

import type { Mission } from "../types/mission";

export function MyPageMainPage() {
  const navigate = useNavigate();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [myDino, setMyDino] = useState<MyDinoResponse | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [meData, dinoData, missionData] = await Promise.allSettled([
          getMe(),
          getMyDino(),
          getTodayMissions(),
        ]);

        if (meData.status === "fulfilled") {
          setMe(meData.value);
        }

        if (dinoData.status === "fulfilled") {
          setMyDino(dinoData.value);
        }

        if (missionData.status === "fulfilled") {
          setMissions(missionData.value);
        }

        if (meData.status === "rejected") {
          throw meData.reason;
        }
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "마이페이지 정보를 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  const completedMissionCount = missions.filter(
    (mission) => mission.completed,
  ).length;

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">MY PAGE</p>

            <h1 className="mt-2 text-3xl font-bold">마이페이지</h1>

            <p className="mt-2 text-sm text-gray-600">
              내 프로필, 공룡 상태, 오늘의 미션 현황을 확인해요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          >
            홈으로 이동
          </button>
        </header>

        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            마이페이지 정보를 불러오는 중입니다...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-3xl bg-[#FFF0EA] p-6 text-sm font-bold text-[#E07A5F] shadow-sm">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#5F8C74]">PROFILE</p>

              <h2 className="mt-2 text-2xl font-bold">
                {me?.nickname ?? "닉네임 없음"}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                이메일: {me?.email ?? "-"}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                지역: {me?.regionName ?? me?.regionCode ?? "지역 정보 없음"}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                상태: {me?.status ?? "-"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/mypage/edit")}
                  className="rounded-2xl bg-[#5F8C74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
                >
                  프로필 수정하기
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/mypage/bill")}
                  className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
                >
                  고지서 입력하기
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/mypage/trend")}
                  className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
                >
                  에너지 트렌드 보기
                </button>
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="flex min-h-48 flex-col rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">오늘의 미션</p>

                <p className="mt-2 text-3xl font-bold text-[#5F8C74]">
                  {completedMissionCount} / {missions.length}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/missions")}
                  className="mt-auto w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f]"
                >
                  미션 보러가기
                </button>
              </article>

              <article className="flex min-h-48 flex-col rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">나의 디노</p>

                <p className="mt-2 text-2xl font-bold text-[#2C3531]">
                  {myDino?.nickname ?? "공룡 없음"}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  성장 단계: {myDino?.stage ?? "-"}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/dino-room")}
                  className="mt-auto w-full rounded-2xl bg-[#E07A5F] py-3 text-sm font-bold text-white transition hover:bg-[#c8654d]"
                >
                  디노룸으로 이동
                </button>
              </article>

              <article className="flex min-h-48 flex-col rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">퀴즈</p>

                <p className="mt-2 text-2xl font-bold text-[#2C3531]">
                  에코 퀴즈
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  하루 한 번 퀴즈를 풀고 AP를 받을 수 있어요.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="mt-auto w-full rounded-2xl border border-[#5F8C74] bg-white py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
                >
                  홈에서 퀴즈 풀기
                </button>
              </article>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
