export const HeightLabel = {
  TINY: "Tiny",
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  HUGE: "Huge",
  GARGANTUAN: "Gargantuan",
} as const;

export type HeightLabel = (typeof HeightLabel)[keyof typeof HeightLabel];