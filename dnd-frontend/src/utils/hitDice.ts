import type { Character } from "@appTypes/Character/Character";

export interface HitDie {
  die: string;
  sides: number;
  total: number;
  left: number;
}

/** "3d10+2d8" (multiclass) → [{ die: "d10", total: 3 }, { die: "d8", total: 2 }], biggest die first. */
export function hitDicePool(c: Pick<Character, "hitDice" | "hitDiceSpent">): HitDie[] {
  const totals = new Map<number, number>();
  for (const [, n, sides] of (c.hitDice ?? "").matchAll(/(\d*)\s*d\s*(\d+)/gi)) {
    totals.set(+sides, (totals.get(+sides) ?? 0) + (n === "" ? 1 : +n));
  }
  return [...totals]
    .sort(([a], [b]) => b - a)
    .map(([sides, total]) => {
      const die = `d${sides}`;
      return { die, sides, total, left: Math.max(0, total - (c.hitDiceSpent?.[die] ?? 0)) };
    });
}

/** Levels left for the main class once the multiclass levels are taken out of the character level. */
export function mainClassLevel(c: Pick<Character, "level" | "isMulticlass" | "multiclasses">): number {
  const extra = c.isMulticlass ? (c.multiclasses ?? []) : [];
  return (c.level ?? 1) - extra.reduce((n, m) => n + (m.level || 0), 0);
}

/** "Wizard 4 / Cleric 1" for a multiclass character, just "Wizard" otherwise. */
export function classSummary(c: Pick<Character, "characterClass" | "level" | "isMulticlass" | "multiclasses">): string {
  const extra = c.isMulticlass ? (c.multiclasses ?? []).filter((m) => m.name.trim()) : [];
  if (!extra.length) return c.characterClass ?? "";
  return [`${c.characterClass || "Unknown"} ${mainClassLevel(c)}`, ...extra.map((m) => `${m.name.trim()} ${m.level}`)].join(" / ");
}

/** "3d10 + 2d8" from each class's level and hit die; undefined until the main class die is picked (older characters). */
export function classHitDice(c: Pick<Character, "level" | "hitDie" | "isMulticlass" | "multiclasses">): string | undefined {
  if (!c.hitDie) return undefined;
  const classes = [{ level: mainClassLevel(c), hitDie: c.hitDie }, ...(c.isMulticlass ? (c.multiclasses ?? []) : [])];
  return classes.filter((x) => x.level > 0 && x.hitDie > 0).map((x) => `${x.level}d${x.hitDie}`).join(" + ");
}

export const formatPool = (pool: HitDie[]) => pool.map((d) => `${d.left}${d.die}`).join(" + ");

export interface ShortRestResult {
  patch: Pick<Character, "hitPoints" | "hitDiceSpent" | "classResources"> & Partial<Pick<Character, "deathSavesSuccesses" | "deathSavesFailures">>;
  rolls: { die: string; roll: number }[];
  healed: number;
}

const d = (sides: number) => 1 + Math.floor(Math.random() * sides);

/**
 * 5e short rest: each hit die spent heals roll + CON modifier (never below 0), up to max HP;
 * resources that recharge on a short rest refill. Done here, not on the backend, since effects (CON, max HP) are applied here.
 */
export function shortRest(
  c: Pick<Character, "hitDice" | "hitDiceSpent" | "hitPoints" | "classResources">,
  spend: Record<string, number>,
  conMod: number,
  maxHp: number,
  roll = d,
): ShortRestResult {
  const spent = { ...c.hitDiceSpent };
  const rolls: ShortRestResult["rolls"] = [];
  let healed = 0;
  for (const { die, sides, left } of hitDicePool(c)) {
    const count = Math.min(Math.max(0, Math.floor(spend[die] ?? 0)), left);
    for (let i = 0; i < count; i++) {
      const r = roll(sides);
      rolls.push({ die, roll: r });
      healed += Math.max(0, r + conMod);
    }
    if (count) spent[die] = (spent[die] ?? 0) + count;
  }
  const hp = c.hitPoints ?? 0;
  const patch: ShortRestResult["patch"] = {
    hitPoints: healed ? Math.max(hp, Math.min(maxHp, Math.max(0, hp) + healed)) : hp,
    hitDiceSpent: spent,
    classResources: (c.classResources ?? []).map((r) => (r.recharge === "short" ? { ...r, current: r.max } : r)),
  };
  // Regaining any hit points from 0 ends dying.
  if (healed && hp <= 0) Object.assign(patch, { deathSavesSuccesses: 0, deathSavesFailures: 0 });
  return { patch, rolls, healed: patch.hitPoints - hp };
}
