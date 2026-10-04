import { useEffect, useState } from "react";
import type { Character } from "@appTypes/Character/Character";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import type { Spell } from "@appTypes/Spell";
import { getSpellById } from "@services/spellService";

export interface TableAction {
  key: string;
  name: string;
  detail: string;
  /** To-hit first (if any), then damage. Rolled by the server in one log entry. */
  expressions: string[];
}

const LIMIT = 40;
const DICE = /(\d*)d(\d+)(?:\s*([+-])\s*(\d+))?/i;

const mod = (score: number | undefined) => Math.floor(((score ?? 10) - 10) / 2);
const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

/** "1d8" + 3 → "1d8+3"; keeps a modifier already in the dice. Null when there are no dice. */
function addModifier(dice: string, extra: number): string | null {
  const m = DICE.exec(dice);
  if (!m) return null;
  const own = m[4] ? (m[3] === "-" ? -Number(m[4]) : Number(m[4])) : 0;
  const total = own + extra;
  return `${m[1] || "1"}d${m[2]}${total ? signed(total) : ""}`;
}

/** Lowest slot level for leveled spells; the highest tier at or below the character level for cantrips. */
function spellDice(spell: Spell, level: number): string | null {
  const bySlot = spell.damage?.damageAtSlotLevel;
  if (bySlot && Object.keys(bySlot).length) {
    const lowest = Object.keys(bySlot).map(Number).sort((a, b) => a - b)[0];
    return addModifier(bySlot[lowest], 0);
  }
  const byLevel = spell.damage?.damageAtCharacterLevel;
  if (byLevel && Object.keys(byLevel).length) {
    const tiers = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
    const tier = [...tiers].reverse().find((t) => t <= level) ?? tiers[0];
    return addModifier(byLevel[tier], 0);
  }
  return null;
}

/** Attack roll for a weapon with damage dice; null for anything else. */
export function weaponAction(weapon: Pick<Equipment, "id" | "name" | "damage" | "range" | "tags">, c: Character): TableAction | null {
  if (!weapon.damage?.damageDice) return null;
  const tags = (weapon.tags ?? []).map((t) => t.toLowerCase());
  const ranged = (weapon.range?.normal ?? 5) > 10 || tags.some((t) => t.includes("ranged"));
  const finesse = tags.some((t) => t.includes("finesse"));
  const str = mod(c.abilityScores?.str);
  const dex = mod(c.abilityScores?.dex);
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

function spellAction(spell: Spell, c: Character): TableAction | null {
  const dice = spellDice(spell, c.level ?? 1);
  if (!dice) return null;
  const type = spell.damage?.damageType?.name ?? "";
  if (spell.attackType) {
    const bonus = c.spellAttackBonus ?? 0;
    return {
      key: `s-${spell.name}`,
      name: spell.name,
      detail: `${signed(bonus)} to hit · ${dice} ${type}`.trim(),
      expressions: [`1d20${signed(bonus)}`, dice],
    };
  }
  const save = spell.dc?.dcType?.name;
  return {
    key: `s-${spell.name}`,
    name: spell.name,
    detail: `${save ? `DC ${c.spellSaveDc} ${save} · ` : ""}${dice} ${type}`.trim(),
    expressions: [dice],
  };
}

/** The character's damaging spells as one-click rolls. Weapons roll from the inventory modal. */
export function useSpellAttacks(character: Character | null | undefined) {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(false);
  const spellIds = (character?.spells ?? []).map((s) => s.spellId).slice(0, LIMIT).join(",");

  useEffect(() => {
    if (!spellIds) {
      setSpells([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    Promise.all(spellIds.split(",").map((id) => getSpellById(id).catch(() => null)))
      .then((list) => {
        if (!cancelled) setSpells(list.filter((s): s is Spell => !!s?.damage));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [spellIds]);

  // Bonuses come from the live character, so level-ups and stat changes show without refetching.
  const actions = character
    ? [...spells]
        .sort((a, b) => a.level - b.level)
        .map((s) => spellAction(s, character))
        .filter((a): a is TableAction => a !== null)
    : [];

  return { actions, loading };
}
