import type { MiningConfig, MiningState, MiningStats, OreCounts, SlotKey } from "@services/miningService";
import { GEAR_SLOTS, type Tiers } from "./art/gear";

export const critHit = (s: MiningStats) => Math.round(s.power * s.critMult);

export const boltHit = (s: MiningStats, big = false, crit = false) =>
  Math.round(s.power * (big ? 5 : 3) * (s.setBonus === 7 ? 1.5 : 1) * (crit ? s.critMult : 1));

export const discounted = (cost: OreCounts, discount: number): OreCounts =>
  Object.fromEntries(Object.entries(cost).map(([k, n]) => [k, Math.ceil(n * (1 - discount))]));

export const canAfford = (cost: OreCounts | null, ores: OreCounts) =>
  !!cost && Object.entries(cost).every(([k, n]) => (ores[k] ?? 0) >= n);

export const total = (counts: OreCounts) => Object.values(counts).reduce((a, b) => a + b, 0);

export const fillUpTo = (pile: OreCounts, order: string[], room: number): OreCounts => {
  const out: OreCounts = {};
  let left = Math.max(0, room);
  for (const key of order) {
    const n = Math.min(pile[key] ?? 0, left);
    if (n > 0) out[key] = n;
    left -= n;
  }
  return out;
};

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
      return `${(1000 / s.swingMs).toFixed(2)} swings / sec${s.armor ? ` · takes ${pct(s.armor)} less damage` : ""}`;
    case "helm":
      return `${s.light.toFixed(1)} blocks of light · ${compact(s.maxHp)} health${s.oreSight ? ` · senses ore ${s.oreSight} blocks past the light` : ""}`;
    case "charm":
      return `${Math.round(s.critZone * 100)}% crit chance · ×${s.critMult} crit · +${Math.round(s.luck * 100)}% luck${s.chainCrit ? " · crits spark into the next block" : ""}`;
    case "satchel":
      return `×${s.yield} ore per block · carries ${s.capacity}`;
    case "boots":
      return `dash hits ×${s.dashMult} · ${s.dashTiles} tiles · recharges in ${(s.dashMs / 1000).toFixed(1)} s`;
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
    stats: [
      { label: "Swings / sec", value: (s) => 1000 / s.swingMs, show: (n) => n.toFixed(2) },
      { label: "Armor", value: (s) => s.armor, show: (n) => `-${pct(n)} damage`, gain: (d) => `-${pct(d)}` },
    ],
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
  boots: {
    stats: [
      { label: "Dash hit", value: (s) => s.dashMult, show: (n) => `×${n}`, gain: (d) => `+${+d.toFixed(2)}×` },
      { label: "Dash distance", value: (s) => s.dashTiles, show: (n) => `${n} tiles` },
      { label: "Dash recharge", value: (s) => -s.dashMs, show: (n) => `${(-n / 1000).toFixed(1)} s`, gain: (d) => `-${(d / 1000).toFixed(2)} s` },
    ],
    perks: [],
  },
};

export const dashHit = (s: MiningStats) =>
  Math.round((s.setBonus === 10 ? critHit(s) : s.power * (s.setBonus === 9 ? 2 : 1)) * (s.dashMult ?? 1));

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
  ["Starbiter", "Crits slow monsters for 3 seconds, and a Byeshk ward hums around you: every second it bites monsters within 2.5 blocks for 60% of your pickaxe damage. Byeshk radiation can't get through it."],
  ["Silver Flame", "Crits on monsters set them burning. Fire hurts mimics too."],
  ["Featherlight", "Jump two blocks high."],
  ["Unbreaking", "Monsters hit you 30% softer."],
  ["Fallen Star", "Half again as much ore from every block, and a full block more light."],
];

export const WIDE_VIEW_SET = 5;
export const WIDE_VIEW = 1.2;
export const viewOf = (setBonus: number) => (setBonus >= WIDE_VIEW_SET ? WIDE_VIEW : 1);
export const setDoes = (set: number) =>
  `${SET_BONUSES[set][1]}${set >= WIDE_VIEW_SET ? " You also see 20% more of the mine around you." : ""}`;

export const DASH_PERKS = [
  "",
  "Dash leaves a trail of warm sparks.",
  "Dash shoulder-checks monsters a tile back.",
  "Dash scatters gold glitter.",
  "Dash frosts monsters, slowing them for 2 s.",
  "Dash recharges 0.4 s faster.",
  "Dash staggers monsters for half a second.",
  "Dash sets monsters burning, and its fire hurts mimics.",
  "Dash carries you 1 tile further.",
  "Dash hits twice as hard, staggers and knocks monsters 2 tiles back.",
  "Every dash hit is a crit, trailing stardust.",
];

export const tiersOf = (state: MiningState): Tiers =>
  Object.fromEntries(GEAR_SLOTS.map((s) => [s, Math.min(10, state.gear[s] ?? 0)])) as Tiers;

export const forgedOf = (state: MiningState): Tiers =>
  Object.fromEntries(GEAR_SLOTS.map((s) => [s, Math.min(10, Math.max(state.forged?.[s] ?? 0, state.gear[s] ?? 0))])) as Tiers;

export const HOLDING_TIER = 11;
export const wearsHolding = (state: MiningState) => (state.gear.satchel ?? 0) >= HOLDING_TIER;
export const ownsHolding = (state: MiningState) => wearsHolding(state) || (state.forged?.satchel ?? 0) >= HOLDING_TIER;
