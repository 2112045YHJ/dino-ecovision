// src/pages/OnboardingProfilePage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkNickname, saveOnboardingProfile } from "../api/meApi";

// 지역 목록 API가 아직 없으므로,
// 프론트에서 임시로 사용하는 지역 목록입니다.
const mockRegions = [
  {
    regionCode: "2635051000",
    regionName: "부산광역시 해운대구 우동",
  },
  {
    regionCode: "2635052000",
    regionName: "부산광역시 해운대구 중동",
  },
  {
    regionCode: "2635053000",
    regionName: "부산광역시 해운대구 좌동",
  },
  {
    regionCode: "2611051000",
    regionName: "부산광역시 중구 중앙동",
  },
];

export function OnboardingProfilePage() {
  // 페이지 이동을 도와주는 함수입니다.
  const navigate = useNavigate();

  // 사용자가 입력한 닉네임입니다.
  const [nickname, setNickname] = useState("");

  // 사용자가 선택한 지역 코드입니다.
  const [regionCode, setRegionCode] = useState(mockRegions[0].regionCode);

  // 닉네임 중복 확인 결과 메시지입니다.
  const [nicknameMessage, setNicknameMessage] = useState("");

  // 닉네임 사용 가능 여부입니다.
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);

  // 닉네임 중복 확인 중인지 저장합니다.
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  // 온보딩 저장 중인지 저장합니다.
  const [isSaving, setIsSaving] = useState(false);

  // 에러 메시지입니다.
  const [errorMessage, setErrorMessage] = useState("");

  // 닉네임 입력값이 바뀔 때 실행됩니다.
  const handleNicknameChange = (value: string) => {
    setNickname(value);

    // 닉네임이 바뀌면 이전 중복확인 결과는 의미가 없어집니다.
    setIsNicknameAvailable(false);
    setNicknameMessage("");
    setErrorMessage("");
  };

  // 닉네임 중복 확인 버튼을 눌렀을 때 실행됩니다.
  const handleCheckNickname = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setNicknameMessage("닉네임을 입력해주세요.");
      setIsNicknameAvailable(false);
      return;
    }

    if (trimmedNickname.length < 2) {
      setNicknameMessage("닉네임은 2자 이상 입력해주세요.");
      setIsNicknameAvailable(false);
      return;
    }

    try {
      setIsCheckingNickname(true);
      setErrorMessage("");

      const result = await checkNickname(trimmedNickname);

      if (result.available) {
        setIsNicknameAvailable(true);
        setNicknameMessage("사용 가능한 닉네임입니다.");
      } else {
        setIsNicknameAvailable(false);
        setNicknameMessage("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      console.error(error);

      setIsNicknameAvailable(false);
      setNicknameMessage("");
      setErrorMessage("닉네임 중복 확인에 실패했습니다.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // 저장 버튼을 눌렀을 때 실행됩니다.
  const handleSubmit = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    if (!isNicknameAvailable) {
      setErrorMessage("닉네임 중복 확인을 먼저 해주세요.");
      return;
    }

    if (!regionCode) {
      setErrorMessage("지역을 선택해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await saveOnboardingProfile({
        nickname: trimmedNickname,
        regionCode,
      });

      // 백엔드 답변 기준:
      // 닉네임/지역 저장 후에도 공룡 선택을 안 했으면 onboardingRequired가 true입니다.
      // 그래서 온보딩 프로필 저장 성공 후에는 공룡 선택 화면으로 이동합니다.
      navigate("/onboarding/dino");
    } catch (error) {
      console.error(error);

      setErrorMessage("온보딩 정보를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">ONBOARDING</p>

          <h1 className="mt-2 text-2xl font-bold">프로필을 설정해주세요</h1>

          <p className="mt-2 text-sm text-gray-600">
            사용할 닉네임과 활동 지역을 설정하면, 다음 단계에서 공룡을 선택할 수
            있어요.
          </p>

          {/* 닉네임 입력 영역 */}
          <div className="mt-6">
            <label
              htmlFor="nickname"
              className="block text-sm font-bold text-[#2C3531]"
            >
              닉네임
            </label>

            <div className="mt-2 flex gap-2">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(event) => handleNicknameChange(event.target.value)}
                placeholder="예: 초록디노"
                className="min-w-0 flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
              />

              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={isCheckingNickname}
                className="shrink-0 rounded-2xl bg-[#5F8C74] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
              >
                {isCheckingNickname ? "확인 중" : "중복 확인"}
              </button>
            </div>

            {nicknameMessage && (
              <p
                className={`mt-2 text-sm font-bold ${
                  isNicknameAvailable ? "text-[#5F8C74]" : "text-[#E07A5F]"
                }`}
              >
                {nicknameMessage}
              </p>
            )}
          </div>

          {/* 지역 선택 영역 */}
          <div className="mt-6">
            <label
              htmlFor="region"
              className="block text-sm font-bold text-[#2C3531]"
            >
              활동 지역
            </label>

            <select
              id="region"
              value={regionCode}
              onChange={(event) => setRegionCode(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
            >
              {mockRegions.map((region) => (
                <option key={region.regionCode} value={region.regionCode}>
                  {region.regionName}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-gray-500">
              지역 목록 API가 아직 구현 전이라 임시 지역 목록을 사용하고
              있습니다.
            </p>
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="mt-6 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
              {errorMessage}
            </div>
          )}

          {/* 저장 버튼 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
          >
            {isSaving ? "저장 중..." : "다음으로"}
          </button>
        </div>
      </section>
    </main>
  );
}
