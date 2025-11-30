import type { AbilityScores } from "./Character/AbilityScores";

export interface MonsterHP {
  average?: number;
  formula?: string;
  special?: string;
}

export interface MonsterSpeed {
  walk?: number;
  swim?: number;
  fly?: number;
  climb?: number;
  burrow?: number;
}

export interface MonsterType {
  type?: string;
  tags?: string[];
}

export interface Monster {
  id?: string;
  name?: string;
  isNpc?: boolean;
  isDeleted?: boolean;

  createdByUserId?: string;
  ownerIds?: string[];

  hitPoints?: MonsterHP;
  size?: string[];
  alignment?: string[];
  speed?: MonsterSpeed;
  armorClass?: number[];

  cr?: number;
  languages?: string[];
  passive?: number;
  senses?: string[];
  source?: string;
  lore?: string;

  abilityScores?: AbilityScores;
  type?: MonsterType;

  createdAt?: string;
  updatedAt?: string;
}
