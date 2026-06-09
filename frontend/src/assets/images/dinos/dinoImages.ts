// src/assets/images/dinos/dinoImages.ts

// 티라노 이미지
import tyranoEgg from "./tyrano-egg.png";
import tyranoHatchling from "./tyrano-hatchling.png";
import tyranoJuvenile from "./tyrano-juvenile.png";
import tyranoAdult from "./tyrano-adult.png";

// 용각류 이미지
import sauroEgg from "./sauro-egg.png";
import sauroHatchling from "./sauro-hatchling.png";
import sauroJuvenile from "./sauro-juvenile.png";
import sauroAdult from "./sauro-adult.png";

// 각룡류 이미지
import ceratoEgg from "./cerato-egg.png";
import ceratoHatchling from "./cerato-hatchling.png";
import ceratoJuvenile from "./cerato-juvenile.png";
import ceratoAdult from "./cerato-adult.png";

export type DinoType = "TYRANO" | "SAURO" | "CERATO";

export type DinoStage = "EGG" | "HATCHLING" | "JUVENILE" | "ADULT";

export const dinoImagesByType = {
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
