import { useSyncExternalStore } from "react";
import type { MiningConfig, MiningState, OreCounts } from "@services/miningService";
import { itemName } from "./art/gear";
import { canAfford, discounted, forgedOf } from "./mine";

export type GoalKind = "gear" | "forge" | "pet";
export interface Goal {
  id: string;
  kind: GoalKind;
  key: string;
  name: string;
  cost: OreCounts;
}

export function goalsFor(config: MiningConfig, state: MiningState): Goal[] {
  const forge = config.forges[state.forgeLevel - 1];
  const out: Goal[] = [];
  for (const slot of config.slots) {
    const next = slot.tiers[(forgedOf(state)[slot.key] ?? 0) + 1];
    if (next?.cost && next.tier <= forge.maxTier)
      out.push({
        id: `gear:${slot.key}`,
        kind: "gear",
        key: slot.key,
        name: itemName(slot.key, next.tier),
        cost: discounted(next.cost, forge.discount),
      });
  }
  const nextForge = config.forges[state.forgeLevel];
  if (nextForge?.cost) out.push({ id: "forge", kind: "forge", key: "forge", name: nextForge.name, cost: nextForge.cost });
  for (const p of config.pets)
    if (!state.pets.includes(p.key) && (!p.mythic || state.foxRevealed))
      out.push({ id: `pet:${p.key}`, kind: "pet", key: p.key, name: p.name, cost: p.cost });
  return out;
}

export const progress = (cost: OreCounts, ores: OreCounts) => {
  const parts = Object.entries(cost);
  return parts.length ? parts.reduce((a, [k, n]) => a + Math.min(1, (ores[k] ?? 0) / n), 0) / parts.length : 1;
};

export const withSatchel = (ores: OreCounts, satchel: OreCounts): OreCounts => {
  const out = { ...ores };
  for (const [k, n] of Object.entries(satchel)) out[k] = (out[k] ?? 0) + n;
  return out;
};

export function pickGoal(goals: Goal[], ores: OreCounts, pinned: string | null): Goal | null {
  const pin = goals.find((g) => g.id === pinned);
  if (pin) return pin;
  const open = goals.filter((g) => !canAfford(g.cost, ores));
  return open.sort((a, b) => progress(b.cost, ores) - progress(a.cost, ores))[0] ?? goals[0] ?? null;
}

export const newlyAffordable = (goals: Goal[], before: OreCounts, after: OreCounts) =>
  goals.filter((g) => canAfford(g.cost, after) && !canAfford(g.cost, before));

const PIN_KEY = "deepdelve-goal";
const listeners = new Set<() => void>();
let pinned: string | null = typeof localStorage === "undefined" ? null : localStorage.getItem(PIN_KEY);

export function setPinnedGoal(id: string | null) {
  pinned = id;
  if (id) localStorage.setItem(PIN_KEY, id);
  else localStorage.removeItem(PIN_KEY);
  for (const l of listeners) l();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const usePinnedGoal = () => useSyncExternalStore(subscribe, () => pinned);
