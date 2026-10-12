import type { AbilityScores } from "./Character/AbilityScores";

export interface MonsterSpeed {
  walk: number;
  fly?: number | null;
  swim?: number | null;
  climb?: number | null;
  burrow?: number | null;
  hover?: boolean;
}

/** A trait, action, reaction or legendary action; description is plain text with \n between lines. */
export interface MonsterFeature {
  name: string;
  description: string;
}

/** A stat block. Ability modifiers, proficiency bonus and XP are derived (see @utils/monster). */
export interface Monster {
  id?: string;
  /** null = core (shared, read-only). */
  campaignId?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;

  name: string;
  /** "MM", "SRD 5.1"...; empty for homebrew. */
  source?: string | null;
  /** Import id ("srd-2014/goblin"); null for hand-made monsters. */
  sourceKey?: string | null;
  isNpc: boolean;

  size?: string | null;
  type?: string | null;
  tags: string[];
  alignment?: string | null;

  armorClass: number;
  armorNote?: string | null;
  hitPoints: number;
  hitDice?: string | null;
  speed: MonsterSpeed;
  abilityScores: AbilityScores;

  /** Total bonus by ability key ("dex": 6). */
  savingThrows: Record<string, number>;
  /** Total bonus by skill ("perception": 13). */
  skills: Record<string, number>;
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: string[];
  passivePerception: number;
  languages: string[];
  challengeRating: number;

  traits: MonsterFeature[];
  actions: MonsterFeature[];
  bonusActions: MonsterFeature[];
  reactions: MonsterFeature[];
  legendaryActions: MonsterFeature[];

  /** Lore / DM notes, markdown. */
  description?: string | null;
  /** R2 URL; also the tabletop token art. */
  imageUrl?: string | null;
}

export interface MonsterSearch {
  query?: string;
  type?: string;
  minCr?: number;
  maxCr?: number;
  isNpc?: boolean;
  sortBy?: "name" | "cr";
  desc?: boolean;
  page?: number;
  pageSize?: number;
}

export type SrdRuleset = "2014" | "2024";

export interface SrdMonsterEntry {
  key: string;
  name: string;
  /** Already in core under this name (it won't be duplicated). */
  exists: boolean;
  /** Every monster with this name, in core or any campaign, has art. */
  hasImage: boolean;
}

export interface SrdImportResult {
  created: number;
  skipped: number;
  imagesAdded: number;
  failed: string[];
}

export interface MonsterMigrationReport {
  dryRun: boolean;
  legacy: number;
  converted: number;
  copiesResolved: number;
  missingParents: string[];
  skippedMods: Record<string, number>;
}
