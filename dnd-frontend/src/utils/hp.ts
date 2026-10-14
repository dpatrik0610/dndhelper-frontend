import type { Character } from "@appTypes/Character/Character";
import { concentrationDc, isConcentration } from "./concentration";
import { computeEffects, signed } from "./effects";

type HpPatch = Pick<Character, "hitPoints" | "temporaryHitPoints" | "conditions"> & Partial<Pick<Character, "deathSavesSuccesses" | "deathSavesFailures">>;

export interface HpChange {
  patch: HpPatch;
  message: string;
  concentration?: string;
}

export function applyHp(character: Character, amount: number): HpChange {
  const effects = computeEffects(character);
  const hp = character.hitPoints ?? 0;
  const maxHp = effects.stats.maxHp.value || hp;
  const tempHp = Math.max(character.temporaryHitPoints ?? 0, 0);
  const conditions = character.conditions ?? [];

  if (amount >= 0) {
    const hitPoints = Math.max(hp, Math.min(maxHp, Math.max(0, hp) + amount));
    const patch: HpPatch = { hitPoints, temporaryHitPoints: tempHp, conditions };
    if (amount && hp <= 0) Object.assign(patch, { deathSavesSuccesses: 0, deathSavesFailures: 0 });
    return { patch, message: `Healed ${hitPoints - hp} HP (now ${hitPoints}/${maxHp}).` };
  }

  const damage = -amount;
  const toTemp = Math.min(damage, tempHp);
  const hitPoints = hp - (damage - toTemp);
  const change: HpChange = {
    patch: { hitPoints, temporaryHitPoints: tempHp - toTemp, conditions },
    message: `Took ${damage} damage (now ${hitPoints}/${maxHp}).`,
  };
  if (!conditions.some(isConcentration)) return change;
  if (hitPoints <= 0) {
    change.patch.conditions = conditions.filter((c) => !isConcentration(c));
    change.message += " Concentration lost.";
  } else {
    const save = effects.stats["save:con"];
    const mode = save.roll === "normal" ? "" : ` with ${save.roll}`;
    change.concentration = `Make a Con save (${signed(save.value)}${mode}) against DC ${concentrationDc(damage)}, or remove Concentrating.`;
  }
  return change;
}
