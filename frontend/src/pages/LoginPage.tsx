// src/pages/LoginPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  // 페이지 이동을 도와주는 함수입니다.
  // navigate('/home') → 홈 화면으로 이동합니다.
  const navigate = useNavigate();

  // 로그인/회원가입 화면을 전환하기 위한 상태입니다.
  // false = 로그인 화면
  // true = 회원가입 화면
  const [isSignupMode, setIsSignupMode] = useState(false);

  // 사용자가 입력한 이메일을 저장합니다.
  const [email, setEmail] = useState("");

  // 사용자가 입력한 비밀번호를 저장합니다.
  const [password, setPassword] = useState("");

  // 회원가입 모드에서 사용할 닉네임입니다.
  const [nickname, setNickname] = useState("");

  // 에러 문구를 저장합니다.
  const [errorMessage, setErrorMessage] = useState("");

  // 로그인 또는 회원가입 버튼을 눌렀을 때 실행됩니다.
  const handleSubmit = () => {
    setErrorMessage("");

    // 이메일을 입력하지 않았을 때
    if (!email.trim()) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    // 비밀번호를 입력하지 않았을 때
    if (!password.trim()) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }

    // 회원가입 모드인데 닉네임을 입력하지 않았을 때
    if (isSignupMode && !nickname.trim()) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    // 지금은 백엔드 API가 없으므로 임시로 성공 처리합니다.
    if (isSignupMode) {
      alert("회원가입이 완료되었습니다. 프로필 설정 화면으로 이동합니다.");
      navigate("/onboarding/profile");
      return;
    }

    alert("로그인되었습니다.");
    navigate("/home");
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] p-6 text-[#2C3531]">
      <section className="mx-auto flex min-h-screen max-w-md items-center">
        <div className="w-full rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#5F8C74]">ECOVISION</p>

          <h1 className="mt-2 text-3xl font-bold">
            {isSignupMode ? "회원가입" : "로그인"}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {isSignupMode
              ? "EcoVision을 시작하기 위한 계정을 만들어주세요."
              : "오늘의 탄소 절감 미션을 시작해보세요."}
          </p>

          <div className="mt-6 grid gap-4">
            {isSignupMode && (
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[#5F8C74]">닉네임</span>

                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="예: 초록초록이"
                  className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 outline-none focus:border-[#5F8C74]"
                />
              </label>
            )}

            <label className="grid gap-2">
              <span className="text-sm font-bold text-[#5F8C74]">이메일</span>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 outline-none focus:border-[#5F8C74]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-[#5F8C74]">비밀번호</span>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="rounded-2xl border border-[#E8F2EC] bg-[#FAF9F5] px-4 py-3 outline-none focus:border-[#5F8C74]"
              />
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
            {isSignupMode ? "회원가입하기" : "로그인하기"}
          </button>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-[#E8F2EC] bg-white py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            onClick={() => {
              setIsSignupMode((prev) => !prev);
              setErrorMessage("");
            }}
          >
            {isSignupMode
              ? "이미 계정이 있어요. 로그인하기"
              : "아직 계정이 없어요. 회원가입하기"}
          </button>

          <p className="mt-5 text-center text-xs text-gray-500">
            현재 화면은 Mock 데이터 기준입니다. 백엔드 API 완성 후 실제
            로그인으로 연결할 예정입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
