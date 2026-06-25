// src/utils/nickname.ts
//
// 닉네임 규칙: 2~12자의 한글/영문/숫자만 허용한다.
// 온보딩(OnboardingProfilePage)과 마이페이지 수정(MyPage 모달)이 동일 규칙을
// 공유하기 위해 한 곳에서 정의한다. 규칙이 바뀌면 이 파일만 고치면 된다.

export const NICKNAME_REGEX = /^[가-힣A-Za-z0-9]{2,12}$/;

export const NICKNAME_RULE_MESSAGE =
  "닉네임은 2~12자의 한글, 영문, 숫자만 사용할 수 있습니다.";

export function isValidNickname(nickname: string): boolean {
  return NICKNAME_REGEX.test(nickname);
}
