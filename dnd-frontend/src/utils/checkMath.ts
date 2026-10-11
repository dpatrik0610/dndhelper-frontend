import type { RollMode } from "@utils/effects";

/** The d20 roll needed to reach the DC; 1 means it can't fail, 21+ means it can't succeed. */
export const rollNeeded = (modifier: number, dc: number) => dc - modifier;

/** Chance a check or save meets the DC. A natural 20 is not an automatic success on these in 5e. */
export function passChance(modifier: number, dc: number, roll: RollMode = "normal") {
  const p = Math.min(1, Math.max(0, (21 - rollNeeded(modifier, dc)) / 20));
  return roll === "advantage" ? 1 - (1 - p) ** 2 : roll === "disadvantage" ? p * p : p;
}

const SIZE_CARRY: Record<string, number> = { Tiny: 0.5, Large: 2, Huge: 4, Gargantuan: 8 };
const mod = (score: number) => Math.floor((score - 10) / 2);

/** PHB carrying, jumping and breath rules from STR, CON and size. */
export function physicalLimits(str: number, con: number, size?: string) {
  const carry = str * 15 * (SIZE_CARRY[size ?? ""] ?? 1);
  return {
    carry,
    pushDragLift: carry * 2,
    longJump: str,
    highJump: Math.max(0, 3 + mod(str)),
    breathMinutes: Math.max(0.5, 1 + mod(con)),
  };
}
