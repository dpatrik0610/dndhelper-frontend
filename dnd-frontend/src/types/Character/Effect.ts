/**
 * Targets: an ability ("con"), "save:dex", "saves" (all saves), "skill:Stealth", "checks" (all ability checks),
 * "attack", "ac", "speed", "initiative", "maxHp", "spellDc", "spellAttack". A "note" has no target.
 */
export type ModifierType = "bonus" | "set" | "min" | "advantage" | "disadvantage" | "note";

export interface StatModifier {
  target: string;
  type: ModifierType;
  value?: number;
  text?: string;
  /** Only counts while this situation (e.g. "Swamp") is switched on for the character; empty = always. */
  when?: string;
}

export type EffectSource = "item" | "potion" | "spell" | "feature" | "custom";

/** Layered over the base sheet, never written into it; removing the effect restores the base. */
export interface CharacterEffect {
  id: string;
  name: string;
  source: EffectSource;
  equipmentId?: string;
  /** Added because the item is in the character's "Equipment" inventory; removed when it leaves. */
  auto?: boolean;
  active: boolean;
  note?: string;
  modifiers: StatModifier[];
}
