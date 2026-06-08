// src/assets/images/dinos/dinoImages.ts

import dinoEgg from "./dino-egg.png";
import dinoHatchling from "./dino-hatchling.png";
import dinoHatchlingHappy from "./dino-hatchling-happy.png";
import dinoJuvenile from "./dino-juvenile.png";
import dinoAdult from "./dino-adult.png";

import type { DinoStage } from "../../../types/dino";

// 기본 성장 단계별 이미지
export const dinoImages: Record<DinoStage, string> = {
  EGG: dinoEgg,
  HATCHLING: dinoHatchling,
  JUVENILE: dinoJuvenile,
  ADULT: dinoAdult,
};

// 감정 상태용 이미지
export const dinoEmotionImages = {
  HATCHLING_HAPPY: dinoHatchlingHappy,
};
