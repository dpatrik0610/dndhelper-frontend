import type { SavingThrows } from "./SavingThrows";
import type { Currency } from "../Currency";
import type { AbilityScores } from "./AbilityScores";
import { HeightLabel } from "./HeightLabel";
import type { SpellSlot } from "./SpellSlot";
import type { Skill } from "./Skill";
import type { Feature } from "./Feature";

// ❌ means it is still now shown in the character profile
export interface Character {
  // METADATA
  id?: string;
  ownerIds?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;

  // BASIC INFO
  name: string; // ✅
  isDead: boolean; // ✅
  isNPC: boolean; 
  campaignId?: string | null; // ✅
  race: string; // ✅
  characterClass: string; // ✅
  background: string; // ✅
  level: number; // ✅
  armorClass: number; // ✅
  hitPoints: number; // ✅
  maxHitPoints: number; // ✅
  temporaryHitPoints: number; // ✅
  speed: number; // ✅
  initiative: number; // ✅
  alignment: string; // ✅
  proficiencyBonus: number; // ✅
  hitDice: string; // ✅

  proficiencies: string[]; // ✅
  languages: string[]; // ✅
  conditions: string[]; // ✅
  resistances: string[]; // ❌
  immunities: string[]; // ❌
  vulnerabilities: string[];
  features: Feature[]; // ✅
  actions: string[]; // ✅
  spells: string[]; // ✅
  currencies: Currency[]; // ✅

  // STATBLOCK
  abilityScores: AbilityScores; // ✅
  savingThrows: SavingThrows; // ✅
  inspiration: number; // ✅
  skills: Skill[] // ✅
  spellSaveDc: number; // ✅
  spellAttackBonus: number; // ✅
  spellSlots: SpellSlot[]; // ✅
  spellcastingAbility: string;
  deathSavesSuccesses: number; // ✅
  deathSavesFailures: number; // ✅
  passivePerception: number; // ✅
  passiveInvestigation: number; // ✅
  passiveInsight: number; // ✅
  experience: number; // ✅
  carryingCapacity: number; // ❌
  currentEncumbrance: number; // ❌

  // FILLER //  All ✅
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
