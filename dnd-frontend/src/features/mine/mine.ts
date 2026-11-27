import type { MiningConfig, MiningState, MiningStats, OreCounts, SlotKey } from "@services/miningService";
import { GEAR_SLOTS, type Tiers } from "./art/gear";

export const critHit = (s: MiningStats) => Math.round(s.power * s.critMult);

export const discounted = (cost: OreCounts, discount: number): OreCounts =>
  Object.fromEntries(Object.entries(cost).map(([k, n]) => [k, Math.ceil(n * (1 - discount))]));

export const canAfford = (cost: OreCounts | null, ores: OreCounts) =>
  !!cost && Object.entries(cost).every(([k, n]) => (ores[k] ?? 0) >= n);

export const total = (counts: OreCounts) => Object.values(counts).reduce((a, b) => a + b, 0);

const compactFmt = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
export const compact = (n: number) => (n < 10_000 ? Math.round(n).toLocaleString("en") : compactFmt.format(n));

export const renownBreakdown = (ores: MiningConfig["ores"], mined: OreCounts) =>
  ores
    .map((o, index) => ({ index, name: o.name, count: mined[o.key] ?? 0, value: o.value, total: (mined[o.key] ?? 0) * o.value }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.total - a.total);

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

type StatSpec = { label: string; value: (s: MiningStats) => number; show: (n: number) => string; gain?: (d: number) => string };
type Perk = { label: string; on: (s: MiningStats) => boolean };

const pct = (n: number) => `${Math.round(n * 100)}%`;

const STAT_SPECS: Record<SlotKey, { stats: StatSpec[]; perks: Perk[] }> = {
  pickaxe: {
    stats: [
      { label: "Damage", value: (s) => s.power, show: compact },
      { label: "Breaks to depth", value: (s) => s.maxDepth, show: String },
      { label: "Reach", value: (s) => s.reach, show: (n) => `${n} block${n === 1 ? "" : "s"}` },
    ],
    perks: [
      { label: "Digs 2×2", on: (s) => s.wide },
      { label: "Cracks along whole veins", on: (s) => s.vein },
    ],
  },
  gauntlets: {
    stats: [{ label: "Swings / sec", value: (s) => 1000 / s.swingMs, show: (n) => n.toFixed(2) }],
    perks: [],
  },
  helm: {
    stats: [
      { label: "Light", value: (s) => s.light, show: (n) => `${n.toFixed(1)} blocks`, gain: (d) => `+${d.toFixed(1)}` },
      { label: "Health", value: (s) => s.maxHp, show: compact },
      { label: "Ore sense", value: (s) => s.oreSight, show: (n) => (n ? `${n} blocks` : "none") },
    ],
    perks: [],
  },
  charm: {
    stats: [
      { label: "Crit chance", value: (s) => s.critZone, show: pct, gain: (d) => `+${pct(d)}` },
      { label: "Crit power", value: (s) => s.critMult, show: (n) => `×${n}`, gain: (d) => `+${+d.toFixed(2)}×` },
      { label: "Luck", value: (s) => s.luck, show: (n) => `+${pct(n)}`, gain: (d) => `+${pct(d)}` },
    ],
    perks: [{ label: "Crits spark into the next block", on: (s) => s.chainCrit }],
  },
  satchel: {
    stats: [
      { label: "Ore per block", value: (s) => s.yield, show: (n) => `×${n}`, gain: (d) => `+${+d.toFixed(2)}×` },
      { label: "Carries", value: (s) => s.capacity, show: compact },
    ],
    perks: [],
  },
};

export const characterSheet = (s: MiningStats) =>
  GEAR_SLOTS.map((slot) => ({
    slot,
    rows: STAT_SPECS[slot].stats.map((st) => ({ label: st.label, value: st.show(st.value(s)) })),
    perks: STAT_SPECS[slot].perks.filter((p) => p.on(s)).map((p) => p.label),
  }));

export interface StatRow {
  label: string;
  now: string;
  next: string;
  gain: string | null;
}

export const statRows = (slot: SlotKey, now: MiningStats, next: MiningStats) => {
  const spec = STAT_SPECS[slot];
  const rows: StatRow[] = spec.stats
    .map((st) => {
      const a = st.value(now);
      const b = st.value(next);
      if (a === 0 && b === 0) return null;
      const diff = b - a;
      const gain =
        diff <= 1e-9
          ? null
          : st.gain
            ? st.gain(diff)
            : Number.isInteger(diff)
              ? `+${compact(diff)}`
              : `+${a ? Math.round((diff / a) * 100) : 100}%`;
      return { label: st.label, now: st.show(a), next: st.show(b), gain };
    })
    .filter((r): r is StatRow => !!r);
  const perks = spec.perks.filter((p) => p.on(next)).map((p) => ({ label: p.label, fresh: !p.on(now) }));
  return { rows, perks };
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

export const setProgress = (tiers: Tiers) =>
  SET_BONUSES.slice(1).map(([name, does], k) => ({
    tier: k + 1,
    name,
    does,
    have: GEAR_SLOTS.filter((slot) => tiers[slot] === k + 1).length,
  }));

export const tiersOf = (state: MiningState): Tiers =>
  Object.fromEntries(GEAR_SLOTS.map((s) => [s, state.gear[s] ?? 0])) as Tiers;
