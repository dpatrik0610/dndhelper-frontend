import type { MiningState, MiningStats, OreCounts, SlotKey } from "@services/miningService";
import { GEAR_SLOTS, type Tiers } from "./art/gear";

export const critHit = (s: MiningStats) => Math.round(s.power * s.critMult);

export const discounted = (cost: OreCounts, discount: number): OreCounts =>
  Object.fromEntries(Object.entries(cost).map(([k, n]) => [k, Math.ceil(n * (1 - discount))]));

export const canAfford = (cost: OreCounts | null, ores: OreCounts) =>
  !!cost && Object.entries(cost).every(([k, n]) => (ores[k] ?? 0) >= n);

export const total = (counts: OreCounts) => Object.values(counts).reduce((a, b) => a + b, 0);

const compactFmt = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
export const compact = (n: number) => (n < 10_000 ? Math.round(n).toLocaleString("en") : compactFmt.format(n));

export const statLine = (slot: SlotKey, s: MiningStats) => {
  switch (slot) {
    case "pickaxe":
      return `${compact(s.power)} damage · breaks through to depth ${s.maxDepth}${s.reach > 1 ? ` · reaches ${s.reach} blocks` : ""}${s.wide ? " · digs 2×2" : ""}${s.vein ? " · cracks along whole veins" : ""}`;
    case "gauntlets":
      return `${(1000 / s.swingMs).toFixed(2)} swings / sec`;
    case "helm":
      return `${s.light.toFixed(1)} blocks of light · ${compact(s.maxHp)} health${s.oreSight ? ` · senses ore ${s.oreSight} blocks past the light` : ""}`;
    case "charm":
      return `${Math.round(s.critZone * 100)}% crit chance · ×${s.critMult} crit · +${Math.round(s.luck * 100)}% luck${s.chainCrit ? " · crits spark into the next block" : ""}`;
    case "satchel":
      return `×${s.yield} ore per block · carries ${s.capacity}`;
  }
};

const HP_STOPS = [
  [224, 64, 48],
  [240, 140, 40],
  [240, 210, 60],
  [90, 200, 80],
];

export const hpColor = (frac: number) => {
  const f = Math.max(0, Math.min(1, frac)) * (HP_STOPS.length - 1);
  const i = Math.min(HP_STOPS.length - 2, Math.floor(f));
  const k = f - i;
  const [r, g, b] = HP_STOPS[i].map((v, j) => Math.round(v + (HP_STOPS[i + 1][j] - v) * k));
  return `rgb(${r},${g},${b})`;
};

export const SET_BONUSES: [string, string][] = [
  ["", ""],
  ["Warm Glow", "Half a block more light."],
  ["Ironclad", "Monsters hit you 15% softer."],
  ["Gilded", "10% more luck for rare ore."],
  ["Fey-Bane", "5% more crit chance."],
  ["Never-Rust", "Swings come a little faster."],
  ["Starbiter", "Crits on monsters slow them down for 3 seconds."],
  ["Silver Flame", "Crits on monsters set them burning. Fire hurts mimics too."],
  ["Featherlight", "Jump two blocks high."],
  ["Unbreaking", "Monsters hit you 30% softer."],
  ["Fallen Star", "Half again as much ore from every block, and a full block more light."],
];

export const tiersOf = (state: MiningState): Tiers =>
  Object.fromEntries(GEAR_SLOTS.map((s) => [s, state.gear[s] ?? 0])) as Tiers;
