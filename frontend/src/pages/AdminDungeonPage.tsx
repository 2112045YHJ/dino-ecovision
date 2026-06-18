// src/pages/AdminDungeonPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { triggerDungeon, changeUserStatus } from "../api/adminApi";

type UserStatusType = "ACTIVE" | "INACTIVE" | "BANNED";

export function AdminDungeonPage() {
  const navigate = useNavigate();

  // 던전 발령
  const [reserveRate, setReserveRate] = useState("7.5");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchMessage, setLaunchMessage] = useState("");
  const [launchSuccess, setLaunchSuccess] = useState(false);

  // 사용자 상태 변경
  const [userId, setUserId] = useState("");
  const [newStatus, setNewStatus] = useState<UserStatusType>("BANNED");
  const [statusReason, setStatusReason] = useState("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSuccess, setStatusSuccess] = useState(false);

  const handleLaunchDungeon = async () => {
    const rate = Number(reserveRate);
    const duration = Number(durationMinutes);

    if (isNaN(rate) || rate < 0 || rate >= 10) {
      setLaunchMessage("예비율은 0 이상 10 미만으로 입력해주세요.");
      setLaunchSuccess(false);
      return;
    }

    if (isNaN(duration) || duration < 1) {
      setLaunchMessage("지속 시간은 1분 이상 입력해주세요.");
      setLaunchSuccess(false);
      return;
    }

    try {
      setIsLaunching(true);
      setLaunchMessage("");

      await triggerDungeon(rate, duration);

      setLaunchMessage(
        `✅ 예비율 ${rate}% 기준 ${duration}분 던전이 발령되었습니다!`,
      );
      setLaunchSuccess(true);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "던전 발령에 실패했습니다.";
      setLaunchMessage(message);
      setLaunchSuccess(false);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleChangeUserStatus = async () => {
    const userIdNum = Number(userId);

    if (isNaN(userIdNum) || userIdNum <= 0) {
      setStatusMessage("올바른 사용자 ID를 입력해주세요.");
      setStatusSuccess(false);
      return;
    }

    if (!statusReason.trim()) {
      setStatusMessage("사유를 입력해주세요.");
      setStatusSuccess(false);
      return;
    }

    try {
      setIsChangingStatus(true);
      setStatusMessage("");

      const result = await changeUserStatus(userIdNum, newStatus, statusReason);

      setStatusMessage(
        `✅ 사용자 ${result.userId}의 상태가 ${result.status}로 변경되었습니다.`,
      );
      setStatusSuccess(true);

      // 입력 초기화
      setUserId("");
      setStatusReason("");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "회원 상태 변경에 실패했습니다.";
      setStatusMessage(message);
      setStatusSuccess(false);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#5F8C74]">ADMIN</p>

            <h1 className="mt-2 text-3xl font-bold">시스템 제어</h1>

            <p className="mt-2 text-sm text-gray-600">
              던전 수동 발령 및 회원 계정 관리를 수행하는 관리자 화면입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/csv-upload")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              CSV 업로드
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-2xl border border-[#5F8C74] px-5 py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            >
              홈으로 가기
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {/* 던전 수동 발령 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#E07A5F]">
              DUNGEON SIMULATOR
            </p>

            <h2 className="mt-2 text-xl font-bold">수동 던전 시뮬레이터</h2>

            <p className="mt-2 text-sm text-gray-600">
              테스트를 위해 예비율 10% 미만의 피크 경보 상황을 강제로
              발령합니다.
            </p>

            <div className="mt-5">
              <label
                htmlFor="reserveRate"
                className="block text-sm font-bold text-[#2C3531]"
              >
                가짜 예비율 입력 (%)
              </label>

              <input
                id="reserveRate"
                type="number"
                value={reserveRate}
                onChange={(e) => {
                  setReserveRate(e.target.value);
                  setLaunchMessage("");
                }}
                min="0"
                max="9.9"
                step="0.1"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#E07A5F]"
              />

              <p className="mt-2 text-xs text-gray-500">
                10% 미만으로 입력해야 던전 발령 조건이 충족됩니다.
              </p>
            </div>

            <div className="mt-4">
              <label
                htmlFor="durationMinutes"
                className="block text-sm font-bold text-[#2C3531]"
              >
                지속 시간 (분)
              </label>

              <input
                id="durationMinutes"
                type="number"
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(e.target.value);
                  setLaunchMessage("");
                }}
                min="1"
                step="1"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#E07A5F]"
              />
            </div>

            {launchMessage && (
              <div
                className={`mt-4 rounded-2xl p-4 text-sm font-bold ${
                  launchSuccess
                    ? "bg-[#E8F2EC] text-[#5F8C74]"
                    : "bg-[#FFF0EA] text-[#E07A5F]"
                }`}
              >
                {launchMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleLaunchDungeon}
              disabled={isLaunching}
              className="mt-5 w-full rounded-2xl bg-[#E07A5F] py-3 font-bold text-white transition hover:bg-[#c8654d] disabled:bg-gray-300"
            >
              {isLaunching ? "발령 중..." : "🔥 던전 강제 발령 시작"}
            </button>

            <p className="mt-3 text-xs text-gray-500">
              ⚠️ 관리자 권한이 필요한 작업입니다.
            </p>
          </article>

          {/* 어뷰징 회원 관리 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">USER MANAGEMENT</p>

            <h2 className="mt-2 text-xl font-bold">회원 계정 상태 변경</h2>

            <p className="mt-2 text-sm text-gray-600">
              어뷰징 또는 불건전 활동 유저의 계정 상태를 관리합니다.
            </p>

            <div className="mt-5">
              <label
                htmlFor="userId"
                className="block text-sm font-bold text-[#2C3531]"
              >
                사용자 ID
              </label>

              <input
                id="userId"
                type="number"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setStatusMessage("");
                }}
                placeholder="예: 1"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="newStatus"
                className="block text-sm font-bold text-[#2C3531]"
              >
                변경할 상태
              </label>

              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => {
                  setNewStatus(e.target.value as UserStatusType);
                  setStatusMessage("");
                }}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
              >
                <option value="ACTIVE">ACTIVE (활성화)</option>
                <option value="INACTIVE">INACTIVE (비활성화)</option>
                <option value="BANNED">BANNED (영구 차단)</option>
              </select>
            </div>

            <div className="mt-4">
              <label
                htmlFor="statusReason"
                className="block text-sm font-bold text-[#2C3531]"
              >
                사유
              </label>

              <textarea
                id="statusReason"
                value={statusReason}
                onChange={(e) => {
                  setStatusReason(e.target.value);
                  setStatusMessage("");
                }}
                placeholder="예: 허위 신고 유도, 불건전 도배"
                rows={3}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
              />
            </div>

            {statusMessage && (
              <div
                className={`mt-4 rounded-2xl p-4 text-sm font-bold ${
                  statusSuccess
                    ? "bg-[#E8F2EC] text-[#5F8C74]"
                    : "bg-[#FFF0EA] text-[#E07A5F]"
                }`}
              >
                {statusMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleChangeUserStatus}
              disabled={isChangingStatus}
              className="mt-5 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
            >
              {isChangingStatus ? "변경 중..." : "상태 변경 실행"}
            </button>

            <p className="mt-3 text-xs text-gray-500">
              ⚠️ 관리자 권한이 필요한 작업입니다.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
