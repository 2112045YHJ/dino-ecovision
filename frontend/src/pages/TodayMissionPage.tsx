// src/pages/TodayMissionPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeMission, getTodayMissions } from "../api/missionApi";
import {
  getActiveDungeon,
  type ActiveDungeonResponse,
  type DungeonMission,
} from "../api/dungeonApi";

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

// 남은 시간 포맷 (초 → "42분 30초")
function formatRemainingTime(seconds: number) {
  if (seconds <= 0) return "곧 종료";
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return minutes > 0 ? `${minutes}분 ${sec}초` : `${sec}초`;
}

// 일일/던전을 한 모달로 처리하기 위한 정규화된 선택 항목입니다.
type SelectedMission = {
  type: "DAILY" | "DUNGEON";
  assignmentId: number;
  title: string;
  category: string;
  timeSlot: string;
  baseReward: number;
  estimatedCo2Kg: number;
  completed: boolean;
  dungeonMultiplier: number;
};

export function TodayMissionPage() {
  // 다른 화면으로 이동할 때 사용하는 함수입니다.
  // 예: navigate("/home") → 홈 화면으로 이동
  const navigate = useNavigate();

  // 백엔드에서 받아온 오늘의 일일 미션 목록입니다.
  const [missions, setMissions] = useState<Mission[]>([]);

  // 활성 던전(있으면 상단 블록으로 표시)입니다.
  const [dungeon, setDungeon] = useState<ActiveDungeonResponse>(null);

  // 던전 타이머를 매초 갱신하기 위한 현재 시각(ms)입니다.
  const [now, setNow] = useState(() => Date.now());

  // 사용자가 "완료 인증하기" 버튼을 누른 미션을 저장합니다.
  const [selectedMission, setSelectedMission] = useState<SelectedMission | null>(
    null,
  );

  // 미션 목록을 불러오는 중인지 저장합니다.
  const [isLoading, setIsLoading] = useState(true);

  // 미션 완료 처리 중인지 저장합니다.
  const [isCompleting, setIsCompleting] = useState(false);

  // 에러 메시지입니다.
  const [errorMessage, setErrorMessage] = useState("");

  // 페이지가 처음 열릴 때 오늘의 미션 목록과 활성 던전을 백엔드에서 가져옵니다.
  // 일일 미션(5.1)은 필수, 던전(6.1)은 best-effort(실패해도 일일 미션은 보여줌).
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [dailyData, dungeonData] = await Promise.all([
          getTodayMissions(),
          getActiveDungeon().catch(() => null),
        ]);

        setMissions(dailyData);
        setDungeon(dungeonData);
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

    fetchMissions();
  }, []);

  // 던전 블록 타이머: endsAt 기준으로 매초 로컬 카운트다운(네트워크 0).
  useEffect(() => {
    if (!dungeon) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [dungeon]);

  // 던전 종료 감지/재동기화: 30초마다 활성 던전을 다시 받아온다(best-effort).
  // 서버가 던전을 종료하면 null이 되어 블록이 사라지고, endsAt도 서버 기준으로 재동기화된다.
  useEffect(() => {
    if (!dungeon) return;
    const id = setInterval(async () => {
      const fresh = await getActiveDungeon().catch(() => null);
      setDungeon(fresh);
    }, 30000);
    return () => clearInterval(id);
  }, [dungeon]);

  // 던전 미션 목록(활성 던전이 있을 때만)입니다.
  const dungeonMissions: DungeonMission[] = dungeon?.missions ?? [];

  // 던전 종료까지 남은 시간(초). endsAt(절대 시각)에서 매초 파생.
  const dungeonRemainingSeconds = dungeon
    ? Math.max(0, Math.floor((new Date(dungeon.endsAt).getTime() - now) / 1000))
    : 0;

  // 오늘 전체 일일 미션 개수입니다.
  const totalMissionCount = missions.length;

  // 오늘 완료한 일일 미션 개수입니다.
  // 백엔드에서 completed: true로 내려준 미션 개수를 셉니다.
  const completedMissionCount = missions.filter((m) => m.completed).length;

  // 진행률 계산입니다. (일일 미션 기준)
  // 예: 1개 완료 / 전체 3개 = 33%
  const progressPercent =
    totalMissionCount === 0
      ? 0
      : Math.round((completedMissionCount / totalMissionCount) * 100);

  // 일일 미션 카드를 눌렀을 때 선택 항목으로 변환합니다.
  const selectDaily = (mission: Mission) =>
    setSelectedMission({
      type: "DAILY",
      assignmentId: mission.assignmentId,
      title: mission.title,
      category: mission.category,
      timeSlot: getSlotLabel(mission.slot),
      baseReward: mission.baseReward,
      estimatedCo2Kg: mission.estimatedCo2Kg,
      completed: mission.completed,
      dungeonMultiplier: 1,
    });

  // 던전 미션 카드를 눌렀을 때 선택 항목으로 변환합니다.
  const selectDungeon = (mission: DungeonMission) =>
    setSelectedMission({
      type: "DUNGEON",
      assignmentId: mission.assignmentId,
      title: mission.title,
      category: "던전",
      timeSlot: "던전 미션",
      baseReward: mission.baseReward,
      estimatedCo2Kg: mission.estimatedCo2Kg,
      completed: mission.completed,
      dungeonMultiplier: dungeon ? Number(dungeon.dungeonMultiplier) : 2,
    });

  // 미션 완료 모달에서 "완료하기" 버튼을 눌렀을 때 실행됩니다.
  // 일일/던전을 type으로 구분해 동일한 엔드포인트로 완료 처리합니다(API 명세 5.2/6.2).
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
        type: selectedMission.type,
      });

      // 완료 성공 후, 화면에서 해당 미션만 completed: true로 바꿉니다.
      if (selectedMission.type === "DAILY") {
        setMissions((prev) =>
          prev.map((mission) =>
            mission.assignmentId === selectedMission.assignmentId
              ? { ...mission, completed: true }
              : mission,
          ),
        );
      } else {
        setDungeon((prev) =>
          prev
            ? {
                ...prev,
                missions: prev.missions.map((mission) =>
                  mission.assignmentId === selectedMission.assignmentId
                    ? { ...mission, completed: true }
                    : mission,
                ),
              }
            : prev,
        );
      }

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

        {/* 진행률 요약 카드 (일일 미션 기준) */}
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

        {/* 던전 미션 블록 (활성 던전이 있을 때만, 일일 미션 리스트 상단에 별도 표시) */}
        {dungeon && dungeonMissions.length > 0 && (
          <section className="mb-5 rounded-3xl border-2 border-[#E07A5F] bg-[#FFF0EA] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#E07A5F]">
                  🔥 DUNGEON MISSION
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#E07A5F]">
                  던전 발령 중! 보상 ×{dungeon.dungeonMultiplier}
                </h2>
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#E07A5F]">
                {formatRemainingTime(dungeonRemainingSeconds)}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              전력 피크 상황입니다. 던전 미션을 완료하면 보상이 배가됩니다.
            </p>

            <div className="mt-4 grid gap-3">
              {dungeonMissions.map((mission) => (
                <div
                  key={mission.assignmentId}
                  className="relative rounded-2xl border border-[#E07A5F]/40 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-[#E07A5F]">
                        던전 미션 · ×{dungeon.dungeonMultiplier} 보상
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-[#2C3531]">
                        {mission.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-600">
                        예상 절감량 {mission.estimatedCo2Kg} kgCO₂
                      </p>
                    </div>

                    <span className="whitespace-nowrap rounded-full bg-[#FFF0EA] px-3 py-1 text-xs font-bold text-[#E07A5F]">
                      +{mission.baseReward}P
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={mission.completed}
                    className="mt-3 w-full rounded-2xl bg-[#E07A5F] py-2.5 font-bold text-white transition hover:bg-[#c96a51] disabled:bg-gray-300"
                    onClick={() => selectDungeon(mission)}
                  >
                    {mission.completed ? "완료된 미션" : "완료 인증하기"}
                  </button>

                  {/* 완료된 미션 위에 표시할 덮개 */}
                  {mission.completed && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/75">
                      <span className="rounded-full bg-[#E07A5F] px-5 py-2 text-sm font-bold text-white shadow-sm">
                        완료됨
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 일일 미션이 없을 때 */}
        {missions.length === 0 && (
          <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              오늘 배정된 미션이 없습니다.
            </p>
          </section>
        )}

        {/* 일일 미션 카드 목록 */}
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
                    selectDaily(clickedMission);
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

      {/* SB-07 미션 완료 자진신고 확인 모달 */}
      {selectedMission && (
        <MissionCompleteConfirmModal
          category={selectedMission.category}
          timeSlot={selectedMission.timeSlot}
          title={selectedMission.title}
          description={`예상 탄소 절감량: ${selectedMission.estimatedCo2Kg}kg`}
          baseReward={selectedMission.baseReward}
          carbonWeight={carbonInfo.weight}
          carbonWeightLabel={carbonInfo.label}
          dungeonMultiplier={selectedMission.dungeonMultiplier}
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
