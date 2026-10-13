import type { SavingThrows } from "./SavingThrows";
import type { AbilityScores } from "./AbilityScores";
import { HeightLabel } from "./HeightLabel";
import type { SpellSlot } from "./SpellSlot";
import type { ClassResource } from "./ClassResource";
import type { Skill } from "./Skill";
import type { Feature } from "./Feature";
import type { CharacterSpell } from "./CharacterSpell";
import type { CharacterEffect } from "./Effect";
import type { Currency } from "@appTypes/Currency";

/** A class taken on top of the main one when multiclassing. */
export interface ClassLevel {
  name: string;
  level: number;
  /** Hit die sides (8 = d8). */
  hitDie: number;
}

export interface Character {
  // METADATA
  id?: string;
  ownerIds?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;

  // BASIC INFO
  name: string;
  isDead: boolean;
  isNPC: boolean; 
  campaignId?: string | null;
  race: string;
  characterClass: string;
  /** Main class hit die sides (10 = d10). Its level is `level` minus the multiclass levels. Missing on older characters. */
  hitDie?: number | null;
  isMulticlass?: boolean;
  /** Classes taken after the main one; only count while `isMulticlass` is on. */
  multiclasses?: ClassLevel[];
  background: string;
  level: number;
  armorClass: number;
  hitPoints: number;
  maxHitPoints: number;
  temporaryHitPoints: number;
  speed: number;
  initiative: number;
  alignment: string;
  proficiencyBonus: number;
  /** Worked out from `hitDie` and `multiclasses` when the form saves, e.g. "3d10 + 2d8". */
  hitDice: string;
  /** Hit dice spent on short rests, by die ("d10" -> 2). Missing on older characters. */
  hitDiceSpent?: Record<string, number>;

  proficiencies: string[];
  languages: string[];
  conditions: string[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  features: Feature[];
  actions: string[];
  spells: CharacterSpell[];
  currencies: Currency[];

  // STATBLOCK
  abilityScores: AbilityScores;
  savingThrows: SavingThrows;
  inspiration: number;
  skills: Skill[];
  spellSaveDc: number;
  spellAttackBonus: number;
  spellSlots: SpellSlot[];
  classResources: ClassResource[];
  /** Missing on characters saved before effects existed. */
  effects?: CharacterEffect[];
  /** Inventory whose items are worn. "none" = chose to wear nothing; missing = not chosen, guessed from the name. */
  equipmentInventoryId?: string;
  /** Situations happening right now ("Swamp", "Raging"); turn on the changes marked `when` with them. */
  activeSituations?: string[];
  spellcastingAbility: string;
  deathSavesSuccesses: number;
  deathSavesFailures: number;
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
  experience: number;
  carryingCapacity: number;
  currentEncumbrance: number;

  // FILLER
  backstory: string[];
  size: HeightLabel;
  age: number;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  appearance: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  noteIds: string[];
  description: string;

  // COLLECTIONS
  factionIds: string[];
  inventoryIds: string[];
  equipmentId: string;
  isDeleted: boolean;
}
