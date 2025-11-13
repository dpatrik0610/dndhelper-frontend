export interface Equipment {
  id?: string;
  index: string;
  name: string;
  description?: string[];
  dmDescription?: string[];
  cost?: Cost;
  damage?: Damage;
  range?: Range;
  weight?: number;
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
  tags?: string[];
  tier?: string;
}

export interface Cost {
  quantity: number;
  unit: string;
}

export interface Damage {
  damageDice: string;
  damageType: DamageType;
}

export interface DamageType {
  name: string;
}

export interface Range {
  normal: number;
  long: number;
}

export const EQUIPMENT_TIERS = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
] as const;

export type EquipmentTier = (typeof EQUIPMENT_TIERS)[number];