// src/api/authApi.ts

const API_BASE_URL = import.meta.env.DEV ? "http://localhost:8080" : "";

// 백엔드 공통 응답 형태입니다.
// 백엔드는 항상 이런 모양으로 응답합니다.
// {
//   success: true,
//   data: {...},
//   error: null
// }
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details: unknown[];
  } | null;
};

// 회원가입 요청 타입입니다.
type SignupRequest = {
  email: string;
  password: string;
};

// 회원가입 후 실제로 필요한 data 타입입니다.
type SignupResponse = {
  userId: number;
  email: string;
  onboardingRequired: boolean;
};

// 로그인 요청 타입입니다.
type LoginRequest = {
  email: string;
  password: string;
};

// 로그인 후 실제로 필요한 data 타입입니다.
type LoginResponse = {
  accessToken: string;
  onboardingRequired: boolean;
  role: string;
};

// 토큰 재발급 응답 data 타입입니다.
type RefreshResponse = {
  accessToken: string;
};

// 회원가입 API
export async function signup(request: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const result = (await response.json()) as ApiResponse<SignupResponse>;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "회원가입에 실패했습니다.");
  }

  // 중요:
  // LoginPage.tsx에서는 result.onboardingRequired처럼 바로 쓰고 있으므로
  // 전체 응답이 아니라 data만 반환합니다.
  return result.data;
}

// 로그인 API
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",

    // refreshToken 쿠키를 받기 위해 필요합니다.
    credentials: "include",

    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const result = (await response.json()) as ApiResponse<LoginResponse>;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "로그인에 실패했습니다.");
  }

  // 중요:
  // LoginPage.tsx에서는 result.accessToken, result.role처럼 바로 쓰고 있으므로
  // 전체 응답이 아니라 data만 반환합니다.
  return result.data;
}

// 로그아웃 API
export async function logout(): Promise<void> {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",

    // refreshToken 쿠키를 서버에 같이 보내기 위해 필요합니다.
    credentials: "include",

    headers: {
      "Content-Type": "application/json",

      // accessToken이 있을 때만 Authorization 헤더를 보냅니다.
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("로그아웃에 실패했습니다.");
  }
}

// 토큰 재발급 API
export async function refreshAccessToken(): Promise<RefreshResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",

    // refreshToken은 httpOnly 쿠키라서 credentials가 필요합니다.
    credentials: "include",
  });

  const result = (await response.json()) as ApiResponse<RefreshResponse>;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "토큰 재발급에 실패했습니다.");
  }

  // 여기서도 data만 반환합니다.
  return result.data;
}
