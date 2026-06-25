// src/api/apiClient.ts

import { refreshAccessToken } from "./authApi";

const API_BASE_URL = import.meta.env.DEV ? "http://localhost:8080" : "";

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details: ApiErrorDetail[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

// 백엔드 에러 응답을 그대로 담는 에러입니다.
// 기존 호출부의 `err.message` / `error instanceof Error` 사용을 깨지 않으면서,
// `code`(예: "DUPLICATE_NICKNAME")로 정확히 분기할 수 있게 합니다.
export class ApiRequestError extends Error {
  code: string | null;
  details: ApiErrorDetail[];

  constructor(
    message: string,
    code: string | null = null,
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.details = details;
    // ES5로 다운레벨될 때도 instanceof가 동작하도록 프로토타입을 복원합니다.
    Object.setPrototypeOf(this, ApiRequestError.prototype);
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;

  // 토큰을 직접 넘기면 그 값을 쓰고, 없으면 localStorage의 accessToken을 사용합니다.
  token?: string | null;

  // refresh 같은 인증 흐름 자체에는 인터셉터를 태우지 않기 위한 내부 플래그입니다.
  skipAuthRefresh?: boolean;

  // 백엔드가 에러 메시지를 주지 못했을 때 보여줄 기본 메시지입니다.
  fallbackMessage?: string;
}

// 동시에 여러 요청이 401을 받아도 /api/auth/refresh는 한 번만 호출되도록
// 진행 중인 재발급 Promise를 공유합니다.
let refreshPromise: Promise<string> | null = null;

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

// 재발급 실패 시 로컬 토큰을 정리하고 로그인 화면으로 보냅니다.
function handleSessionExpired() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// 진행 중인 재발급이 있으면 그 결과를 공유하고, 없으면 새로 시작합니다.
// 성공하면 새 accessToken을 localStorage에 저장하고 그 값을 반환합니다.
function refreshOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((result) => {
        localStorage.setItem("accessToken", result.accessToken);
        return result.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function doFetch(
  endpoint: string,
  method: string,
  body: unknown,
  token: string | null,
): Promise<Response> {
  // FormData(파일 업로드 등)는 브라우저가 multipart 경계를 직접 설정하도록
  // Content-Type을 비우고 본문을 그대로 보냅니다.
  const isFormData = body instanceof FormData;

  return fetch(`${API_BASE_URL}${endpoint}`, {
    method,

    // refreshToken 쿠키를 주고받기 위해 필요합니다.
    credentials: "include",

    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },

    body:
      body === undefined || body === null
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
  });
}

async function parseResult<T>(response: Response): Promise<ApiResponse<T>> {
  // 204 No Content 등 본문이 없는 응답을 대비해 방어적으로 파싱합니다.
  const text = await response.text();
  if (!text) {
    return { success: response.ok, data: null, error: null };
  }
  return JSON.parse(text) as ApiResponse<T>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    skipAuthRefresh = false,
    fallbackMessage = "요청 처리 중 오류가 발생했습니다.",
  } = options;

  // 토큰을 명시적으로 넘기지 않았으면 localStorage에서 읽어 자동 주입합니다.
  const token = options.token !== undefined ? options.token : getAccessToken();

  let response = await doFetch(endpoint, method, body, token);

  // Access 토큰 만료(401)이면 한 번만 재발급 후 원요청을 재시도합니다.
  if (response.status === 401 && !skipAuthRefresh) {
    try {
      const newToken = await refreshOnce();
      response = await doFetch(endpoint, method, body, newToken);
    } catch {
      // 재발급 자체가 실패하면 세션이 끝난 것으로 보고 로그인으로 보냅니다.
      handleSessionExpired();
      throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  const result = await parseResult<T>(response);

  if (!response.ok || result.success === false) {
    throw new ApiRequestError(
      result.error?.message ?? fallbackMessage,
      result.error?.code ?? null,
      result.error?.details ?? [],
    );
  }

  return result.data as T;
}
