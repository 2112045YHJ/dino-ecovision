// src/assets/images/dinos/dinoImages.ts

// ===============================
// 1. 티라노 기본 이미지
// ===============================
import tyranoEgg from "./tyrano-egg.png";
import tyranoHatchling from "./tyrano-hatchling.png";
import tyranoJuvenile from "./tyrano-juvenile.png";
import tyranoAdult from "./tyrano-adult.png";

// ===============================
// 2. 용각류 기본 이미지
// ===============================
import sauroEgg from "./sauro-egg.png";
import sauroHatchling from "./sauro-hatchling.png";
import sauroJuvenile from "./sauro-juvenile.png";
import sauroAdult from "./sauro-adult.png";

// ===============================
// 3. 각룡류 기본 이미지
// ===============================
import ceratoEgg from "./cerato-egg.png";
import ceratoHatchling from "./cerato-hatchling.png";
import ceratoJuvenile from "./cerato-juvenile.png";
import ceratoAdult from "./cerato-adult.png";

// ===============================
// 4. HATCHLING 행복 이미지
// ===============================
// 지금은 세 공룡 모두 유아기 행복 이미지만 있습니다.
import tyranoHatchlingHappy from "./tyrano-hatchling-happy.png";
import sauroHatchlingHappy from "./sauro-hatchling-happy.png";
import ceratoHatchlingHappy from "./cerato-hatchling-happy.png";

// 공룡 종류입니다.
// TYRANO = 티라노
// SAURO = 용각류
// CERATO = 각룡류
export type DinoType = "TYRANO" | "SAURO" | "CERATO";

// 공룡 성장 단계입니다.
// EGG = 알
// HATCHLING = 유아기
// JUVENILE = 청소년기
// ADULT = 성룡
export type DinoStage = "EGG" | "HATCHLING" | "JUVENILE" | "ADULT";

// ===============================
// 기본 공룡 이미지 보관함
// ===============================
// 평소 화면에 보여줄 이미지입니다.
export const dinoImagesByType: Record<DinoType, Record<DinoStage, string>> = {
  TYRANO: {
    EGG: tyranoEgg,
    HATCHLING: tyranoHatchling,
    JUVENILE: tyranoJuvenile,
    ADULT: tyranoAdult,
  },

  SAURO: {
    EGG: sauroEgg,
    HATCHLING: sauroHatchling,
    JUVENILE: sauroJuvenile,
    ADULT: sauroAdult,
  },

  CERATO: {
    EGG: ceratoEgg,
    HATCHLING: ceratoHatchling,
    JUVENILE: ceratoJuvenile,
    ADULT: ceratoAdult,
  },
};

// ===============================
// 클릭했을 때 보여줄 행복 이미지 보관함
// ===============================
// 지금은 HATCHLING 행복 이미지만 등록합니다.
//
// Partial을 쓰는 이유:
// JUVENILE, ADULT 행복 이미지가 아직 없어도
// 코드 에러가 나지 않게 하기 위해서입니다.
export const dinoHappyImagesByType: Partial<
  Record<DinoType, Partial<Record<DinoStage, string>>>
> = {
  TYRANO: {
    HATCHLING: tyranoHatchlingHappy,
  },

  SAURO: {
    HATCHLING: sauroHatchlingHappy,
  },

  CERATO: {
    HATCHLING: ceratoHatchlingHappy,
  },
};
