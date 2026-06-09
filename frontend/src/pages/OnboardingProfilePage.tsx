// src/pages/OnboardingProfilePage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function OnboardingProfilePage() {
  // 페이지 이동 함수입니다.
  // navigate('/onboarding/dino') → 공룡 선택 화면으로 이동합니다.
  const navigate = useNavigate();

  // 사용자가 입력한 닉네임을 저장합니다.
  const [nickname, setNickname] = useState("");

  // 사용자가 선택한 지역을 저장합니다.
  const [region, setRegion] = useState("");

  // 에러 메시지를 저장합니다.
  const [errorMessage, setErrorMessage] = useState("");

  // 저장 버튼을 눌렀을 때 실행되는 함수입니다.
  const handleSubmit = () => {
    setErrorMessage("");

    if (!nickname.trim()) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    if (nickname.trim().length < 2) {
      setErrorMessage("닉네임은 2글자 이상 입력해주세요.");
      return;
    }

    if (!region) {
      setErrorMessage("거주 동네를 선택해주세요.");
      return;
    }

    // 지금은 백엔드 API가 없으므로 임시 저장 처리합니다.
    alert("프로필 설정이 완료되었습니다.");

    // 다음 단계인 첫 공룡 선택 화면으로 이동합니다.
    navigate("/onboarding/dino");
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto flex min-h-screen max-w-md items-center">
        <div className="w-full rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">ONBOARDING</p>

          <h1 className="mt-2 text-3xl font-bold">프로필 설정</h1>

          <p className="mt-2 text-sm text-gray-600">
            EcoVision에서 사용할 닉네임과 거주 동네를 설정해주세요.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[#5F8C74]">닉네임</span>

              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="예: 초록디노"
                className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 outline-none focus:border-[#5F8C74]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-[#5F8C74]">
                거주 동네
              </span>

              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 outline-none focus:border-[#5F8C74]"
              >
                <option value="">동네를 선택해주세요</option>
                <option value="BUSAN_HAEUNDAE_U">부산 해운대구 우동</option>
                <option value="BUSAN_HAEUNDAE_JWA">부산 해운대구 좌동</option>
                <option value="BUSAN_SUYEONG_GWANGAN">
                  부산 수영구 광안동
                </option>
                <option value="BUSAN_NAM_GWANGAN">부산 남구 대연동</option>
                <option value="BUSAN_JUNG_NAMPO">부산 중구 남포동</option>
              </select>
            </label>
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-[#FFF1EC] px-4 py-3 text-sm font-bold text-[#E07A5F]">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f]"
            onClick={handleSubmit}
          >
            저장하고 다음으로
          </button>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-[#E8F2EC] bg-white py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            onClick={() => navigate("/login")}
          >
            로그인 화면으로 돌아가기
          </button>

          <p className="mt-5 text-center text-xs text-gray-500">
            현재는 Mock 데이터 기준입니다. 백엔드 API 완성 후 사용자 프로필 저장
            API와 연결할 예정입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
