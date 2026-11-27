import { apiClient } from "@api/apiClient";
import type { GearSlot } from "@features/mine/art/gear";

export type OreCounts = Record<string, number>;
export type SlotKey = GearSlot;

export interface MiningStats {
  power: number;
  swingMs: number;
  light: number;
  maxHp: number;
  critZone: number;
  critMult: number;
  luck: number;
  yield: number;
  capacity: number;
  maxDepth: number;
  reach: number;
  wide: boolean;
  vein: boolean;
  oreSight: number;
}

export interface Ore {
  key: string;
  name: string;
  color: string;
  lore: string;
  hardness: number;
  value: number;
}

export interface MiningTier {
  tier: number;
  name: string;
  cost: OreCounts | null;
  stats: MiningStats;
}

export interface MiningSlot {
  key: SlotKey;
  noun: string;
  stat: string;
  tiers: MiningTier[];
}

export interface ForgeInfo {
  level: number;
  name: string;
  maxTier: number;
  discount: number;
  cost: OreCounts | null;
}

export interface PetInfo {
  key: string;
  name: string;
  tier: number;
  mythic: boolean;
  cost: OreCounts;
}

export interface DepthInfo {
  number: number;
  name: string;
  stoneHp: number;
  sealHp: number;
  monsterHp: number;
  monsterDamage: number;
  killLoot: number;
}

export interface MiningConfig {
  ores: Ore[];
  slots: MiningSlot[];
  forges: ForgeInfo[];
  pets: PetInfo[];
  depths: DepthInfo[];
  mapW: number;
  mapH: number;
  liftX: number;
  liftY: number;
  foxNeeds: number;
}

export interface MiningTrip {
  depth: number;
  map: string;
  ladders: number[];
  torches: number[];
  satchel: OreCounts;
  trader: number | null;
  wares: Record<string, OreCounts> | null;
}

export interface MiningState {
  ores: OreCounts;
  mined: OreCounts;
  gear: Partial<Record<SlotKey, number>>;
  forgeLevel: number;
  pets: string[];
  pet: string | null;
  pages: number[];
  firebolt: boolean;
  potions: number;
  foxRevealed: boolean;
  deepestDepth: number;
  stats: MiningStats;
  renown: number;
  swings: number;
  crits: number;
  nodesBroken: number;
  kills: number;
  trip: MiningTrip | null;
}

export interface Break {
  i: number;
  s: number;
  c: number;
}

export interface DigRequest {
  breaks: Break[];
  ladders: number[];
  torches: number[];
  kills: number;
  mimics: number[];
  drank: number;
}

export interface DigResult {
  satchel: OreCounts;
  drops: OreCounts;
  deepestDepth: number;
  trip: MiningTrip | null;
}

export interface MiningScore {
  username: string;
  renown: number;
  gear: Partial<Record<SlotKey, number>>;
  deepestDepth: number;
  nodesBroken: number;
}

const post = <T>(path: string, body?: unknown) => apiClient<T>(`/mining/me${path}`, { method: "POST", body });

export const getMiningConfig = () => apiClient<MiningConfig>("/mining/config");
export const getMiningState = () => apiClient<MiningState>("/mining/me");
export const descend = (depth: number) => post<MiningState>(`/descend/${depth}`);
export const dig = (req: DigRequest) => post<DigResult>("/dig", req);
export const ascend = () => post<MiningState>("/ascend");
export const faint = () => post<MiningState>("/faint");
export const craftGear = (slot: SlotKey) => post<MiningState>(`/craft/${slot}`);
export const upgradeForge = () => post<MiningState>("/forge");
export const buyPet = (key: string) => post<MiningState>(`/pets/${key}`);
export const trade = (item: string) => post<MiningState>(`/trade/${item}`);
export const followPet = (key: string | null) => post<MiningState>(`/follow/${key ?? "none"}`);
export const getMiningScoreboard = () => apiClient<MiningScore[]>("/mining/scoreboard");
