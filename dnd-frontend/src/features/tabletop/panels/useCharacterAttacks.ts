import { useEffect, useState } from "react";
import type { Character } from "@appTypes/Character/Character";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import type { Spell } from "@appTypes/Spell";
import { getInventoriesByCharacter } from "@services/inventoryService";
import { getEquipmentById } from "@services/equipmentService";
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

function weaponAction(weapon: Equipment, c: Character): TableAction | null {
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
    key: `w-${weapon.id ?? weapon.index}`,
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

/** Weapons from the character's inventories and damaging spells, as one-click rolls. */
export function useCharacterAttacks(character: Character | null | undefined) {
  const [weapons, setWeapons] = useState<Equipment[]>([]);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(false);
  const characterId = character?.id;
  const spellIds = (character?.spells ?? []).map((s) => s.spellId).slice(0, LIMIT).join(",");

  useEffect(() => {
    if (!characterId) {
      setWeapons([]);
      setSpells([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const [inventories, spellList] = await Promise.all([
        getInventoriesByCharacter(characterId).catch(() => []),
        Promise.all(spellIds.split(",").filter(Boolean).map((id) => getSpellById(id).catch(() => null))),
      ]);
      const equipmentIds = [
        ...new Set(inventories.flatMap((inv) => inv.items ?? []).map((item) => item.equipmentId).filter((id): id is string => !!id)),
      ].slice(0, LIMIT);
      const equipment = await Promise.all(equipmentIds.map((id) => getEquipmentById(id).catch(() => null)));

      if (cancelled) return;
      setWeapons(equipment.filter((e): e is Equipment => !!e?.damage?.damageDice));
      setSpells(spellList.filter((s): s is Spell => !!s?.damage));
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [characterId, spellIds]);

  // Bonuses come from the live character, so level-ups and stat changes show without refetching.
  const actions = character
    ? [
        ...weapons.map((w) => weaponAction(w, character)),
        ...[...spells].sort((a, b) => a.level - b.level).map((s) => spellAction(s, character)),
      ].filter((a): a is TableAction => a !== null)
    : [];

  return { actions, loading };
}
