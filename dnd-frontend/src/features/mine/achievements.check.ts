// Self-check: npx esbuild src/features/mine/achievements.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import type { MiningConfig, MiningState } from "@services/miningService";
import { achievementsFor, mergeFeats, unlockedNow } from "./achievements";

const config = {
  depths: Array.from({ length: 10 }, (_, i) => ({ number: i + 1, name: `Depth ${i + 1}` })),
  ores: Array.from({ length: 20 }, (_, i) => ({ key: `ore${i}`, name: `Ore ${i}` })),
  slots: ["pickaxe", "gauntlets", "helm", "charm", "satchel"].map((key) => ({
    key,
    noun: key,
    tiers: Array.from({ length: 11 }, (_, t) => ({ tier: t, name: `${key} ${t}` })),
  })),
} as unknown as MiningConfig;

const list = achievementsFor(config);
assert.ok(list.length >= 50 && list.length <= 120, `a healthy number of achievements (${list.length})`);
assert.equal(new Set(list.map((a) => a.id)).size, list.length, "ids are unique");
assert.equal(list.filter((a) => a.hidden).length, 10, "ten hidden ones");
assert.ok(list.every((a) => /^[a-zA-Z0-9_-]{1,40}$/.test(a.id)), "ids pass the server's key filter");

const state = {
  nodesBroken: 12,
  mined: { ore3: 2, diamond: 1 },
  ores: {},
  crits: 0,
  kills: 0,
  pages: [],
  deepestDepth: 3,
  gear: {},
  forgeLevel: 1,
  pets: [],
  firebolt: false,
  foxRevealed: false,
  feats: { smash: 1 },
} as unknown as MiningState;
const ctx = { config, state, feats: mergeFeats(state.feats as Record<string, number>, { geode: 1 }) };
const ids = unlockedNow(list, ctx, new Set(["dig-10"])).map((a) => a.id);
assert.ok(ids.includes("depth-2") && ids.includes("depth-3") && !ids.includes("depth-4"), "depths unlock as reached");
assert.ok(ids.includes("find-ore3") && !ids.includes("find-ore4"), "first finds per ore");
assert.ok(ids.includes("smash-1") && ids.includes("geode-1"), "server and local feats both count");
assert.ok(!ids.includes("dig-10"), "already unlocked ones don't fire again");
assert.ok(ids.includes("diamond-1") && !ids.includes("diamondkept-5"), "diamonds found vs kept");
assert.deepEqual(mergeFeats({ a: 1 }, { a: 2, b: 1 }), { a: 3, b: 1 });
console.log(`achievements ok (${list.length})`);
