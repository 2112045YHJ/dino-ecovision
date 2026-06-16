// src/pages/TodayMissionPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeMission, getTodayMissions } from "../api/missionApi";

import { MissionCard } from "../components/mission/MissionCard";
import { MissionCompleteConfirmModal } from "../components/mission/MissionCompleteConfirmModal";

import type { Mission, MissionSlot } from "../types/mission";

// slot 라벨 변환
function getSlotLabel(slot: MissionSlot) {
  if (slot === "DAY") return "낮";
  if (slot === "EVENING") return "저녁";
  return "언제든";
}

// estimatedCo2Kg 기반으로 carbon weight 계산
function getCarbonWeight(co2Kg: number): { weight: number; label: string } {
  if (co2Kg >= 3) return { weight: 1.5, label: "높음" };
  if (co2Kg >= 1) return { weight: 1.2, label: "보통" };
  return { weight: 1.0, label: "낮음" };
}

export function TodayMissionPage() {
  const navigate = useNavigate();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const totalMissionCount = missions.length;
  const completedMissionCount = missions.filter((m) => m.completed).length;
  const progressPercent =
    totalMissionCount === 0
      ? 0
      : Math.round((completedMissionCount / totalMissionCount) * 100);

  const handleConfirmComplete = async () => {
    if (!selectedMission) return;

    if (selectedMission.completed) {
      alert("이미 완료한 미션입니다.");
      setSelectedMission(null);
      return;
    }

    try {
      setIsCompleting(true);
      setErrorMessage("");

      const result = await completeMission(selectedMission.assignmentId, {
        type: "DAILY",
      });

      setMissions((prev) =>
        prev.map((mission) =>
          mission.assignmentId === selectedMission.assignmentId
            ? { ...mission, completed: true }
            : mission,
        ),
      );

      alert(
        `${result.cappedReward}P를 획득했습니다!\n공룡 EXP +${result.dino.expGained}`,
      );

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

  // 선택된 미션의 carbon weight 계산
  const carbonInfo = selectedMission
    ? getCarbonWeight(selectedMission.estimatedCo2Kg)
    : { weight: 1.0, label: "낮음" };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-3xl">
        <button
          type="button"
          className="mb-4 rounded-2xl border border-[#E8F2EC] bg-white px-4 py-2 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
          onClick={() => navigate("/home")}
        >
          홈으로 돌아가기
        </button>

        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">TODAY MISSION</p>
          <h1 className="mt-2 text-3xl font-bold">오늘의 미션</h1>
          <p className="mt-2 text-sm text-gray-600">
            오늘 할 수 있는 탄소 절감 미션을 완료하고 공룡을 성장시켜보세요.
          </p>
        </header>

        {errorMessage && (
          <section className="mb-5 rounded-3xl bg-[#FFF0EA] p-5 text-sm font-bold text-[#E07A5F] shadow-sm">
            {errorMessage}
          </section>
        )}

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

        {missions.length === 0 && (
          <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              오늘 배정된 미션이 없습니다.
            </p>
          </section>
        )}

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

      {/* SB-07 미션 완료 자진신고 확인 모달 */}
      {selectedMission && (
        <MissionCompleteConfirmModal
          category={selectedMission.category}
          timeSlot={getSlotLabel(selectedMission.slot)}
          title={selectedMission.title}
          description={`예상 탄소 절감량: ${selectedMission.estimatedCo2Kg}kg`}
          baseReward={selectedMission.baseReward}
          carbonWeight={carbonInfo.weight}
          carbonWeightLabel={carbonInfo.label}
          onCancel={() => {
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
