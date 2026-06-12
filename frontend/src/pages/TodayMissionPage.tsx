// src/pages/TodayMissionPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeMission, getTodayMissions } from "../api/missionApi";

import { MissionCard } from "../components/mission/MissionCard";
import { MissionCompleteModal } from "../components/mission/MissionCompleteModal";

import type { Mission } from "../types/mission";

export function TodayMissionPage() {
  // 다른 화면으로 이동할 때 사용하는 함수입니다.
  // 예: navigate("/home") → 홈 화면으로 이동
  const navigate = useNavigate();

  // 백엔드에서 받아온 오늘의 미션 목록입니다.
  const [missions, setMissions] = useState<Mission[]>([]);

  // 사용자가 "완료 인증하기" 버튼을 누른 미션을 저장합니다.
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // 미션 목록을 불러오는 중인지 저장합니다.
  const [isLoading, setIsLoading] = useState(true);

  // 미션 완료 처리 중인지 저장합니다.
  const [isCompleting, setIsCompleting] = useState(false);

  // 에러 메시지입니다.
  const [errorMessage, setErrorMessage] = useState("");

  // 페이지가 처음 열릴 때 오늘의 미션 목록을 백엔드에서 가져옵니다.
  useEffect(() => {
    const fetchTodayMissions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getTodayMissions();

        setMissions(data);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "오늘의 미션 목록을 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayMissions();
  }, []);

  // 오늘 전체 미션 개수입니다.
  const totalMissionCount = missions.length;

  // 오늘 완료한 미션 개수입니다.
  // 백엔드에서 completed: true로 내려준 미션 개수를 셉니다.
  const completedMissionCount = missions.filter(
    (mission) => mission.completed,
  ).length;

  // 진행률 계산입니다.
  // 예: 1개 완료 / 전체 3개 = 33%
  const progressPercent =
    totalMissionCount === 0
      ? 0
      : Math.round((completedMissionCount / totalMissionCount) * 100);

  // 미션 완료 모달에서 "완료하기" 버튼을 눌렀을 때 실행됩니다.
  const handleConfirmComplete = async () => {
    if (!selectedMission) {
      return;
    }

    if (selectedMission.completed) {
      alert("이미 완료한 미션입니다.");
      setSelectedMission(null);
      return;
    }

    try {
      setIsCompleting(true);
      setErrorMessage("");

      // 백엔드에 미션 완료 요청을 보냅니다.
      // 오늘의 미션은 DAILY 타입입니다.
      const result = await completeMission(selectedMission.assignmentId, {
        type: "DAILY",
      });

      // 완료 성공 후, 화면의 미션 목록에서 해당 미션만 completed: true로 바꿉니다.
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission.assignmentId === selectedMission.assignmentId
            ? { ...mission, completed: true }
            : mission,
        ),
      );

      // 백엔드가 실제 적립된 포인트를 cappedReward로 내려줍니다.
      alert(
        `${result.cappedReward}P를 획득했습니다!\n공룡 EXP +${result.dino.expGained}`,
      );

      // 모달을 닫습니다.
      setSelectedMission(null);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "미션 완료 처리에 실패했습니다.";

      setErrorMessage(message);
    } finally {
      setIsCompleting(false);
    }
  };

  // 로딩 중 화면입니다.
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-6 text-[#2C3531]">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">TODAY MISSION</p>
          <p className="mt-2 text-lg font-bold">오늘의 미션을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-3xl">
        {/* 상단 뒤로가기 버튼 */}
        <button
          type="button"
          className="mb-4 rounded-2xl border border-[#E8F2EC] bg-white px-4 py-2 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          onClick={() => navigate("/home")}
        >
          홈으로 돌아가기
        </button>

        {/* 페이지 제목 영역 */}
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">TODAY MISSION</p>

          <h1 className="mt-2 text-3xl font-bold">오늘의 미션</h1>

          <p className="mt-2 text-sm text-gray-600">
            오늘 할 수 있는 탄소 절감 미션을 완료하고 공룡을 성장시켜보세요.
          </p>
        </header>

        {/* 에러 메시지 */}
        {errorMessage && (
          <section className="mb-5 rounded-3xl bg-[#FFF0EA] p-5 text-sm font-bold text-[#E07A5F] shadow-sm">
            {errorMessage}
          </section>
        )}

        {/* 진행률 요약 카드 */}
        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#5F8C74]">
                MISSION PROGRESS
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {completedMissionCount} / {totalMissionCount} 완료
              </h2>
            </div>

            <span className="rounded-full bg-[#E8F2EC] px-4 py-2 text-sm font-bold text-[#5F8C74]">
              {progressPercent}%
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E8F2EC]">
            <div
              className="h-full rounded-full bg-[#5F8C74]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-gray-500">
            완료한 미션은 오늘의 포인트와 공룡 EXP에 반영됩니다.
          </p>
        </section>

        {/* 미션이 없을 때 */}
        {missions.length === 0 && (
          <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              오늘 배정된 미션이 없습니다.
            </p>
          </section>
        )}

        {/* 미션 카드 목록 */}
        <section className="grid gap-4">
          {missions.map((mission) => {
            const isCompleted = mission.completed;

            return (
              <div key={mission.assignmentId} className="relative">
                <MissionCard
                  mission={mission}
                  onCompleteClick={(clickedMission) => {
                    if (clickedMission.completed) {
                      alert("이미 완료한 미션입니다.");
                      return;
                    }

                    setSelectedMission(clickedMission);
                  }}
                />

                {/* 완료된 미션 위에 표시할 덮개 */}
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/75">
                    <span className="rounded-full bg-[#5F8C74] px-5 py-2 text-sm font-bold text-white shadow-sm">
                      완료됨
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </section>

      {/* 미션 완료 확인 모달 */}
      {selectedMission && (
        <MissionCompleteModal
          mission={selectedMission}
          onClose={() => {
            if (!isCompleting) {
              setSelectedMission(null);
            }
          }}
          onConfirm={handleConfirmComplete}
        />
      )}
    </main>
  );
}
