export interface RollResult {
  numberOfDice: number;
  sides: number;
  modifier?: number | null;
  rolls: number[];
  total: number;
  min?: number | null;
  max?: number | null;
  average?: number | null;
  expression?: string | null;
}

export interface SubtleRollEvent extends RollResult {
  rollId: string;
  characterId: string;
  characterName: string;
  campaignId?: string | null;
  rolledByUserId?: string | null;
  rolledByUsername?: string | null;
  note?: string | null;
  timestampUtc: string;
}
