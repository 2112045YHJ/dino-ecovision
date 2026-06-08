// src/pages/TodayMissionPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { MissionCard } from "../components/mission/MissionCard";
import { MissionCompleteModal } from "../components/mission/MissionCompleteModal";

import { mockMissions } from "../mocks/missionMock";
import type { Mission } from "../types/mission";

export function TodayMissionPage() {
  // 다른 화면으로 이동할 때 사용하는 함수입니다.
  // 예: navigate('/home') → 홈 화면으로 이동
  const navigate = useNavigate();

  // 사용자가 "완료 인증하기" 버튼을 누른 미션을 저장합니다.
  // null이면 아직 선택한 미션이 없다는 뜻입니다.
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // 완료된 미션의 assignmentId 목록을 저장합니다.
  // 예: [1, 3]이면 1번, 3번 미션이 완료된 상태입니다.
  const [completedMissionIds, setCompletedMissionIds] = useState<number[]>([]);

  // 오늘 전체 미션 개수입니다.
  const totalMissionCount = mockMissions.length;

  // 오늘 완료한 미션 개수입니다.
  const completedMissionCount = completedMissionIds.length;

  // 진행률 계산입니다.
  // 예: 1개 완료 / 전체 3개 = 33.3%
  const progressPercent =
    totalMissionCount === 0
      ? 0
      : Math.round((completedMissionCount / totalMissionCount) * 100);

  // 미션 완료 모달에서 "완료하기" 버튼을 눌렀을 때 실행됩니다.
  const handleConfirmComplete = () => {
    if (!selectedMission) {
      return;
    }

    // 이미 완료한 미션을 또 완료하지 못하게 막습니다.
    const alreadyCompleted = completedMissionIds.includes(
      selectedMission.assignmentId,
    );

    if (alreadyCompleted) {
      alert("이미 완료한 미션입니다.");
      setSelectedMission(null);
      return;
    }

    // 완료 목록에 현재 미션 ID를 추가합니다.
    setCompletedMissionIds((prev) => [...prev, selectedMission.assignmentId]);

    // 지금은 백엔드 API가 없으므로 alert로 임시 처리합니다.
    alert(`${selectedMission.finalRewardPoint}P를 획득했습니다!`);

    // 모달을 닫습니다.
    setSelectedMission(null);
  };

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
            완료한 미션은 오늘의 포인트와 공룡 EXP에 반영될 예정입니다.
          </p>
        </section>

        {/* 미션 카드 목록 */}
        <section className="grid gap-4">
          {mockMissions.map((mission) => {
            // 현재 미션이 완료된 미션인지 확인합니다.
            const isCompleted = completedMissionIds.includes(
              mission.assignmentId,
            );

            return (
              <div key={mission.assignmentId} className="relative">
                <MissionCard
                  mission={mission}
                  onCompleteClick={(clickedMission) => {
                    // 이미 완료된 미션이면 다시 모달을 열지 않습니다.
                    if (isCompleted) {
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
          onClose={() => setSelectedMission(null)}
          onConfirm={handleConfirmComplete}
        />
      )}
    </main>
  );
}
