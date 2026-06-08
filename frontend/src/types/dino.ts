export type DinoStage = "EGG" | "HATCHLING" | "JUVENILE" | "ADULT";

export interface MyDino {
  id: number;
  name: string;
  stage: DinoStage;
  exp: number;
  requiredExp: number;
  intimacy: number;
}
