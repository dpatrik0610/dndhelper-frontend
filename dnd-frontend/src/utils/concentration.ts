import type { RollMode } from "./effects";

/** Condition label for concentration; "Concentrating: Bless" names the spell too. */
export const CONCENTRATION = "Concentrating";

export const CONCENTRATION_RULE =
  "When you take damage, make a Constitution save (DC 10 or half the damage, whichever is higher) or lose concentration. It also ends at 0 HP or when you start concentrating on something else.";

export const isConcentration = (label: string) => /^concentrat/i.test(label.trim());

/** Con save DC after taking `damage` while concentrating. */
export const concentrationDc = (damage: number) => Math.max(10, Math.floor(damage / 2));

/** Appends `item`; a new concentration replaces the old one, since you can only hold one. */
export const addCondition = <T>(list: T[], item: T, label: (x: T) => string) => [
  ...(isConcentration(label(item)) ? list.filter((x) => !isConcentration(label(x))) : list),
  item,
];

/** Advantage / disadvantage rolls two d20s: the higher / lower total counts. */
export function savePassed(totals: number[], dc: number, mode: RollMode = "normal") {
  const total = mode === "advantage" ? Math.max(...totals) : mode === "disadvantage" ? Math.min(...totals) : totals[0];
  return total >= dc;
}
