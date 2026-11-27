// Self-check: bunx esbuild src/features/mine/goals.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { type Goal, newlyAffordable, pickGoal, progress, withSatchel } from "./goals";

const goal = (id: string, cost: Record<string, number>): Goal => ({ id, kind: "gear", key: id, name: id, cost });
const pick = goal("pick", { copper: 100, tin: 50 });
const boots = goal("boots", { copper: 10 });
const pet = goal("pet", { iron: 40 });

assert.equal(progress({ copper: 100, tin: 50 }, { copper: 50, tin: 50 }), 0.75);
assert.equal(progress({ copper: 10 }, { copper: 99 }), 1, "extra ore never counts past done");
assert.deepEqual(withSatchel({ copper: 5 }, { copper: 2, tin: 1 }), { copper: 7, tin: 1 });

const ores = { copper: 60, tin: 50 };
assert.equal(pickGoal([boots, pick, pet], ores, null)?.id, "pick", "the closest goal you can't afford yet");
assert.equal(pickGoal([boots, pick, pet], ores, "pet")?.id, "pet", "a tracked goal wins");
assert.equal(pickGoal([boots, pick, pet], ores, "gone")?.id, "pick", "a stale pin falls back");
assert.equal(pickGoal([boots], ores, null)?.id, "boots", "everything affordable shows something ready");
assert.equal(pickGoal([], ores, null), null);
assert.deepEqual(
  newlyAffordable([boots, pick, pet], { copper: 5 }, { copper: 100, tin: 50 }).map((g) => g.id),
  ["boots", "pick"],
);
console.log("goals checks passed");
