// src/pages/ProfileEditPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  checkNickname,
  getMe,
  getRegions,
  updateNickname,
  updateRegion,
  type MeResponse,
  type RegionResponse,
} from "../api/userApi";

function getRegionId(region: RegionResponse) {
  return region.regionId ?? region.id ?? 0;
}

function getRegionName(region: RegionResponse) {
  return (
    region.regionName ??
    region.name ??
    [region.sido, region.sigungu].filter(Boolean).join(" ") ??
    "이름 없는 지역"
  );
}

export function ProfileEditPage() {
  const navigate = useNavigate();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [regions, setRegions] = useState<RegionResponse[]>([]);

  const [nickname, setNickname] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState<number>(0);

  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [meData, regionData] = await Promise.all([getMe(), getRegions()]);

        setMe(meData);
        setRegions(regionData);
        setNickname(meData.nickname ?? "");
        setSelectedRegionId(meData.regionId ?? 0);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "프로필 수정 정보를 불러오지 못했습니다.";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCheckNickname = async () => {
    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2) {
      setNicknameCheckMessage("닉네임은 2자 이상 입력해주세요.");
      return;
    }

    try {
      setIsCheckingNickname(true);
      setNicknameCheckMessage("");

      const result = await checkNickname(trimmedNickname);

      if (result.available === true || result.duplicated === false) {
        setNicknameCheckMessage("사용 가능한 닉네임입니다.");
      } else {
        setNicknameCheckMessage("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "닉네임 중복 확인에 실패했습니다.";

      setNicknameCheckMessage(message);
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleSave = async () => {
    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2) {
      setErrorMessage("닉네임은 2자 이상 입력해주세요.");
      return;
    }

    if (!selectedRegionId) {
      setErrorMessage("지역을 선택해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (trimmedNickname !== me?.nickname) {
        await updateNickname(trimmedNickname);
      }

      if (selectedRegionId !== me?.regionId) {
        await updateRegion(selectedRegionId);
      }

      setSuccessMessage("프로필이 수정되었습니다.");

      const updatedMe = await getMe();
      setMe(updatedMe);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "프로필 수정에 실패했습니다.";

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-bold text-[#5F8C74]">PROFILE EDIT</p>

          <h1 className="mt-2 text-3xl font-bold">프로필 수정</h1>

          <p className="mt-2 text-sm text-gray-600">
            닉네임과 지역 정보를 수정할 수 있어요.
          </p>
        </header>

        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-gray-500 shadow-sm">
            프로필 정보를 불러오는 중입니다...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="mb-5 rounded-2xl bg-[#FFF0EA] p-4 text-sm font-bold text-[#E07A5F]">
            {errorMessage}
          </div>
        )}

        {!isLoading && (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-bold">닉네임</label>

            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  setNicknameCheckMessage("");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="min-w-0 flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
              />

              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={isCheckingNickname}
                className="rounded-2xl border border-[#5F8C74] px-4 py-3 text-sm font-bold text-[#5F8C74] disabled:border-gray-300 disabled:text-gray-400"
              >
                {isCheckingNickname ? "확인 중" : "중복 확인"}
              </button>
            </div>

            {nicknameCheckMessage && (
              <p className="mt-2 text-sm font-bold text-[#5F8C74]">
                {nicknameCheckMessage}
              </p>
            )}

            <label className="mt-6 block text-sm font-bold">지역</label>

            <select
              value={selectedRegionId}
              onChange={(event) => {
                setSelectedRegionId(Number(event.target.value));
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5F8C74]"
            >
              <option value={0}>지역을 선택해주세요</option>

              {regions.map((region) => {
                const regionId = getRegionId(region);

                return (
                  <option key={regionId} value={regionId}>
                    {getRegionName(region)}
                  </option>
                );
              })}
            </select>

            {successMessage && (
              <div className="mt-5 rounded-2xl bg-[#E8F2EC] p-4 text-sm font-bold text-[#5F8C74]">
                {successMessage}
              </div>
            )}

            <div className="mt-6 grid gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full rounded-2xl bg-[#5F8C74] py-3 text-sm font-bold text-white transition hover:bg-[#4d735f] disabled:bg-gray-300"
              >
                {isSaving ? "저장 중..." : "저장하기"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/mypage")}
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
              >
                마이페이지로 돌아가기
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
