// src/api/onboardingApi.ts

import { apiRequest } from "./apiClient";

interface ProfileSetupRequest {
  nickname: string;
  regionCode: string;
}

interface FirstDinoRequest {
  dinoType: "TYRANO" | "SAURO" | "CERATO";
  dinoName: string;
}

export function setupProfile(request: ProfileSetupRequest) {
  return apiRequest<void>("/api/onboarding/profile", {
    method: "PATCH",
    body: request,
  });
}

export function selectFirstDino(request: FirstDinoRequest) {
  return apiRequest<void>("/api/onboarding/dino", {
    method: "POST",
    body: request,
  });
}
