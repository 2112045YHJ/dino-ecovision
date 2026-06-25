// src/pages/LoginPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login, signup } from "../api/authApi";

export function LoginPage() {
  // 페이지 이동 함수입니다.
  // navigate('/home') → 홈 화면으로 이동합니다.
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      navigate("/home");
    }
  }, [navigate]);

  // false = 로그인 모드
  // true = 회원가입 모드
  const [isSignupMode, setIsSignupMode] = useState(false);

  // 사용자가 입력한 이메일입니다.
  const [email, setEmail] = useState("");

  // 사용자가 입력한 비밀번호입니다.
  const [password, setPassword] = useState("");

  // 에러 메시지를 화면에 보여주기 위한 상태입니다.
  const [errorMessage, setErrorMessage] = useState("");

  // API 요청 중인지 확인하는 상태입니다.
  // true일 때 버튼을 비활성화해서 중복 클릭을 막습니다.
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 또는 회원가입 버튼 클릭 시 실행됩니다.
  const handleSubmit = async () => {
    setErrorMessage("");

    // 1. 이메일 빈칸 검사
    if (!email.trim()) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    // 2. 비밀번호 빈칸 검사
    if (!password.trim()) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }

    // 3. 회원가입일 때는 백엔드 조건에 맞춰 비밀번호 검사
    // 백엔드 조건:
    // - 8~64자
    // - 영문 + 숫자 포함
    if (isSignupMode) {
      const hasLetter = /[A-Za-z]/.test(password);
      const hasNumber = /\d/.test(password);

      if (password.length < 8 || password.length > 64) {
        setErrorMessage("비밀번호는 8~64자여야 합니다.");
        return;
      }

      if (!hasLetter || !hasNumber) {
        setErrorMessage("비밀번호는 영문과 숫자를 모두 포함해야 합니다.");
        return;
      }
    }

    try {
      setIsLoading(true);

      // 회원가입 모드일 때
      if (isSignupMode) {
        // 1. 회원가입 API 호출
        const signupResult = await signup({
          email: email.trim(),
          password,
        });

        // 2. 회원가입 직후 자동 로그인 API 호출 (토큰 받기)
        const loginResult = await login({
          email: email.trim(),
          password,
        });

        // 3. accessToken과 role을 localStorage에 저장
        localStorage.setItem("accessToken", loginResult.accessToken);
        localStorage.setItem("role", loginResult.role);

        alert("회원가입이 완료되었습니다. 자동으로 로그인합니다.");

        // 4. 온보딩 필요 여부 체크 후 이동
        if (signupResult.onboardingRequired || loginResult.onboardingRequired) {
          navigate("/onboarding/profile");
          return;
        }

        const queryParams = new URLSearchParams(window.location.search);
        const redirectPath = queryParams.get("redirect");
        if (redirectPath) {
          navigate(redirectPath);
          return;
        }

        navigate("/home");
        return;
      }

      // 로그인 모드일 때
      const result = await login({
        email: email.trim(),
        password,
      });

      // 백엔드에서 받은 accessToken을 저장합니다.
      // 나중에 인증이 필요한 API 요청을 보낼 때 사용합니다.
      localStorage.setItem("accessToken", result.accessToken);

      // role도 필요할 수 있어서 같이 저장해둡니다.
      localStorage.setItem("role", result.role);

      alert("로그인되었습니다.");

      // 온보딩이 필요하면 프로필 설정 화면으로 이동합니다.
      if (result.onboardingRequired) {
        navigate("/onboarding/profile");
        return;
      }

      // 온보딩이 끝난 사용자라면 홈으로 이동합니다.
      const queryParams = new URLSearchParams(window.location.search);
      const redirectPath = queryParams.get("redirect");
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/home");
      }
    } catch (error) {
      // apiClient.ts에서 throw new Error(...) 한 메시지가 여기로 들어옵니다.
      if (error instanceof Error) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
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
              ? "이메일과 비밀번호로 계정을 만들어주세요."
              : "이메일과 비밀번호로 로그인해주세요."}
          </p>

          <div className="mt-6 grid gap-4">
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
                placeholder={
                  isSignupMode
                    ? "영문+숫자 포함 8자 이상"
                    : "비밀번호를 입력하세요"
                }
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
            className="mt-6 w-full rounded-2xl bg-[#5F8C74] py-3 font-bold text-white transition hover:bg-[#4d735f] disabled:cursor-not-allowed disabled:bg-gray-300"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading
              ? "처리 중..."
              : isSignupMode
                ? "회원가입하기"
                : "로그인하기"}
          </button>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-[#E8F2EC] bg-white py-3 text-sm font-bold text-[#5F8C74] transition hover:bg-[#E8F2EC]"
            onClick={() => {
              setIsSignupMode((prev) => !prev);
              setErrorMessage("");
              setPassword("");
            }}
            disabled={isLoading}
          >
            {isSignupMode
              ? "이미 계정이 있어요. 로그인하기"
              : "아직 계정이 없어요. 회원가입하기"}
          </button>

          <p className="mt-5 text-center text-xs text-gray-500">
            회원가입 후 닉네임과 동네는 온보딩 화면에서 설정합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
