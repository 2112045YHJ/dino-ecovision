// src/pages/AdminDungeonPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AdminDungeonPage() {
  const navigate = useNavigate();

  const [reserveRate, setReserveRate] = useState("7.5");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchMessage, setLaunchMessage] = useState("");

  const handleLaunchDungeon = async () => {
    const rate = Number(reserveRate);

    if (isNaN(rate) || rate < 0 || rate >= 10) {
      setLaunchMessage("예비율은 0 이상 10 미만으로 입력해주세요.");
      return;
    }

    try {
      setIsLaunching(true);
      setLaunchMessage("");

      // TODO: 실제 API 연결 시 아래 주석을 교체하세요.
      // await launchDungeon({ reserveRate: rate });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLaunchMessage(
        `예비율 ${rate}% 기준으로 60분 던전이 발령되었습니다. (시뮬레이션)`,
      );
    } catch (error) {
      console.error(error);
      setLaunchMessage("던전 발령에 실패했습니다.");
    } finally {
      setIsLaunching(false);
    }
  };

  const userList = [
    {
      id: 1,
      nickname: "bad_user",
      reason: "허위 신고 유도",
      status: "BANNED",
    },
    {
      id: 2,
      nickname: "spammer",
      reason: "불건전 도배",
      status: "INACTIVE",
    },
  ];

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

            {launchMessage && (
              <div
                className={`mt-4 rounded-2xl p-4 text-sm font-bold ${
                  launchMessage.includes("실패") ||
                  launchMessage.includes("입력")
                    ? "bg-[#FFF0EA] text-[#E07A5F]"
                    : "bg-[#E8F2EC] text-[#5F8C74]"
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
              {isLaunching ? "발령 중..." : "60분 던전 강제 발령 시작 →"}
            </button>

            <p className="mt-3 text-xs text-gray-500">
              현재는 시뮬레이션 모드입니다. 실제 API 연결 시 dungeon_events
              테이블에 활성 레코드가 생성됩니다.
            </p>
          </article>

          {/* 어뷰징 회원 관리 */}
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#5F8C74]">USER MANAGEMENT</p>

            <h2 className="mt-2 text-xl font-bold">어뷰징 유저 계정 단속</h2>

            <p className="mt-2 text-sm text-gray-600">
              허위 신고 또는 불건전 활동 유저의 계정 상태를 관리합니다.
            </p>

            <div className="mt-5 space-y-3">
              {userList.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl bg-[#FAF9F5] p-4 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{user.nickname}</p>
                      <p className="mt-1 text-gray-600">{user.reason}</p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        user.status === "BANNED"
                          ? "bg-[#FFF0EA] text-[#E07A5F]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              현재는 더미데이터 기준 화면입니다. 실제 유저 관리 API가 연결되면
              users.status를 INACTIVE 또는 BANNED로 변경할 수 있습니다.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
