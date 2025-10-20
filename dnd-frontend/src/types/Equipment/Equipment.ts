export interface Equipment {
  id?: string;
  index: string;
  name: string;
  description?: string[];
  cost?: Cost;
  damage?: Damage;
  range?: Range;
  weight?: number;
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
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
