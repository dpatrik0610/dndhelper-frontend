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
  setBonus: number;
  armor: number;
  chainCrit: boolean;
  dashMult: number;
  dashTiles: number;
  dashMs: number;
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

export interface HouseInfo {
  level: number;
  name: string;
  cost: number;
  sellBonus: number;
  belt: number;
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
  houses: HouseInfo[];
  maxTorchStock: number;
  torchPrice: number;
  potionPrice: number;
  fireboltPrice: number;
  overload: number;
  mossBuys: number;
  church?: Record<string, number>;
  maxRevives?: number;
  maxRecalls?: number;
  maxBlessingMinutes?: number;
}

export interface MiningTrip {
  depth: number;
  map: string;
  ladders: number[];
  torches: number[];
  satchel: OreCounts;
  trader: number | null;
  motherlode: number | null;
  wares: Record<string, number> | null;
  boons?: string[];
  pile?: OreCounts;
  hp?: number | null;
  pos?: number | null;
}

export interface MiningState {
  ores: OreCounts;
  mined: OreCounts;
  gear: Partial<Record<SlotKey, number>>;
  forged?: Partial<Record<SlotKey, number>>;
  forgeLevel: number;
  pets: string[];
  pet: string | null;
  pages: number[];
  firebolt: boolean;
  fireball?: boolean;
  potions: number;
  revives?: number;
  recalls?: number;
  blessings?: Record<string, number>;
  foxRevealed: boolean;
  deepestDepth: number;
  stats: MiningStats;
  renown: number;
  swings: number;
  crits: number;
  nodesBroken: number;
  kills: number;
  trip: MiningTrip | null;
  feats: Record<string, number>;
  achievements: string[];
  coins: number;
  houseLevel: number;
  torchStock: number;
  belt: number;
  prices: OreCounts;
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
  salamanders?: number;
  feats?: Record<string, number>;
  unlocked?: string[];
  hp?: number;
  pos?: number;
}

export interface DigResult {
  satchel: OreCounts;
  drops: OreCounts;
  deepestDepth: number;
  trip: MiningTrip | null;
  cores?: number;
  loot?: { i: number; ores: OreCounts }[];
  diamonds?: number;
  pile?: OreCounts;
}

export interface MiningScore {
  username: string;
  renown: number;
  gear: Partial<Record<SlotKey, number>>;
  deepestDepth: number;
  nodesBroken: number;
  forgeLevel: number;
  houseLevel: number;
  coins: number;
  diamonds: number;
  achievements?: number;
}

const post = <T>(path: string, body?: unknown, keepalive?: boolean) =>
  apiClient<T>(`/mining/me${path}`, { method: "POST", body, keepalive });

export const getMiningConfig = () => apiClient<MiningConfig>("/mining/config");
export const getMiningState = () => apiClient<MiningState>("/mining/me");
export const descend = (depth: number) => post<MiningState>(`/descend/${depth}`);
export const dig = (req: DigRequest, keepalive?: boolean) => post<DigResult>("/dig", req, keepalive);
export const ascend = () => post<MiningState>("/ascend");
export const faint = () => post<MiningState>("/faint");
export const craftGear = (slot: SlotKey) => post<MiningState>(`/craft/${slot}`);
export const upgradeForge = () => post<MiningState>("/forge");
export const buyPet = (key: string) => post<MiningState>(`/pets/${key}`);
export const trade = (item: string) => post<MiningState>(`/trade/${item}`);
export const buyWare = (item: string, count: number) => post<MiningState>(`/buy/${item}/${count}`);
export const churchBuy = (item: string) => post<MiningState>(`/church/${item}`);
export const reviveDelver = () => post<MiningState>("/revive");
export const recallHome = () => post<MiningState>("/recall");
export const sellOre = (key: string, amount: number) => post<MiningState>(`/sell/${key}/${amount}`);
export const takePile = (take: OreCounts) => post<MiningState>("/pile/take", take);
export const dropOre = (key: string, amount: number) => post<MiningState>(`/drop/${key}/${amount}`);
export const mossSell = (key: string, amount: number) => post<MiningState>(`/moss/sell/${key}/${amount}`);
export const upgradeHouse = () => post<MiningState>("/house");
export const recordFeats = (req: { feats?: Record<string, number>; unlocked?: string[] }) => post<MiningState>("/feats", req);
export const equipGear = (slot: SlotKey, tier: number) => post<MiningState>(`/equip/${slot}/${tier}`);
export const followPet = (key: string | null) => post<MiningState>(`/follow/${key ?? "none"}`);
export const getMiningScoreboard = () => apiClient<MiningScore[]>("/mining/scoreboard");
