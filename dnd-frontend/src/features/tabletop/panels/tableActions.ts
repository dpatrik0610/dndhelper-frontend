import type { Character } from "@appTypes/Character/Character";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { abilityMod } from "@features/tabletop/characterSheet";

export interface TableAction {
  key: string;
  name: string;
  detail: string;
  /** To-hit first (if any), then damage. Rolled by the server in one log entry. */
  expressions: string[];
}

const DICE = /(\d*)d(\d+)(?:\s*([+-])\s*(\d+))?/i;

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

/** "1d8" + 3 → "1d8+3"; keeps a modifier already in the dice. Null when there are no dice. */
function addModifier(dice: string, extra: number): string | null {
  const m = DICE.exec(dice);
  if (!m) return null;
  const own = m[4] ? (m[3] === "-" ? -Number(m[4]) : Number(m[4])) : 0;
  const total = own + extra;
  return `${m[1] || "1"}d${m[2]}${total ? signed(total) : ""}`;
}

/** Attack roll for a weapon with damage dice; null for anything else. */
export function weaponAction(weapon: Pick<Equipment, "id" | "name" | "damage" | "range" | "tags">, c: Character): TableAction | null {
  if (!weapon.damage?.damageDice) return null;
  const tags = (weapon.tags ?? []).map((t) => t.toLowerCase());
  const ranged = (weapon.range?.normal ?? 5) > 10 || tags.some((t) => t.includes("ranged"));
  const finesse = tags.some((t) => t.includes("finesse"));
  const str = abilityMod(c.abilityScores?.str);
  const dex = abilityMod(c.abilityScores?.dex);
  const ability = ranged ? dex : finesse ? Math.max(str, dex) : str;
  const toHit = (c.proficiencyBonus ?? 2) + ability;
  const damage = addModifier(weapon.damage.damageDice, ability);
  if (!damage) return null;
  return {
    key: `w-${weapon.id ?? weapon.name}`,
    name: weapon.name,
    detail: `${signed(toHit)} to hit · ${damage} ${weapon.damage.damageType?.name ?? ""}`.trim(),
    expressions: [`1d20${signed(toHit)}`, damage],
  };
}
