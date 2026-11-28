// Self-check: bunx esbuild src/features/mine/jobs.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import type { MiningQuest } from "@services/miningService";
import { withSatchel } from "./goals";
import { clock, lapsed, limitText, msLeft, needProgress, opensIn, newlyDone, questDone, questProgress, shortOf } from "./jobs";

const quest = (over: Partial<MiningQuest> = {}): MiningQuest => ({
  id: "q1",
  rank: "easy",
  title: "Patch the Hull",
  line: "",
  depth: 2,
  needs: [
    { kind: "ore", key: "iron", count: 20, done: 20 },
    { kind: "alloy", key: "rimebronze", count: 3, done: 3 },
    { kind: "kill", key: "monster", count: 6, done: 3 },
  ],
  coins: 500,
  reward: { gold: 4 },
  minutes: 60,
  due: "2026-11-28T12:00:00Z",
  ...over,
});

assert.equal(clock(0), "0:00");
assert.equal(clock(65_000), "1:05");
assert.equal(clock(3_725_000), "1:02:05");
assert.equal(clock(-5000), "0:00");
assert.equal(limitText(60), "1 h");
assert.equal(limitText(90), "90 min");
assert.equal(msLeft(quest(), Date.parse("2026-11-28T11:00:00Z")), 3_600_000);
assert.equal(msLeft(quest({ due: null }), 0), 3_600_000);

assert.equal(opensIn(quest({ due: null, opens: "2026-11-28T12:30:00Z" }), Date.parse("2026-11-28T12:00:00Z")), 1_800_000);
assert.equal(opensIn(quest({ due: null, opens: "2026-11-28T11:00:00Z" }), Date.parse("2026-11-28T12:00:00Z")), 0);
assert.equal(opensIn(quest({ opens: "2026-11-28T12:30:00Z" }), 0), 0);

const half = quest();
const stocked = { iron: 25, rimebronze: 3 };
assert.equal(questDone(half, stocked), false);
assert.equal(questProgress(half, stocked), (1 + 1 + 0.5) / 3);
assert.deepEqual(shortOf(half, { iron: 25, rimebronze: 1 }), [["rimebronze", 3]]);

const done = quest({ needs: half.needs.map((n) => ({ ...n, done: n.count })) });
const afterSmelting = { iron: 13, rimebronze: 3 };
assert.equal(questDone(done, stocked), true);
assert.equal(questDone(done, afterSmelting), false, "spending a required ore reopens the requirement");
assert.deepEqual(done.needs.map((n) => needProgress(n, afterSmelting)), [13, 3, 6]);
assert.equal(questProgress(done, afterSmelting), (13 / 20 + 1 + 1) / 3);
assert.equal(questDone(done, { iron: 20, rimebronze: 2 }), false, "spending a bar also reopens the requirement");
assert.equal(questDone(done, withSatchel(afterSmelting, { iron: 7 })), true, "recovered ore counts while carried");
assert.equal(needProgress({ ...done.needs[0], done: 8 }, stocked), 8, "stock does not replace recorded activity");
assert.deepEqual(newlyDone([half], [done], stocked).map((q) => q.id), ["q1"]);
assert.deepEqual(newlyDone([half], [done], afterSmelting), [], "no completion notice while short on ore");
assert.deepEqual(newlyDone([done], [done], stocked), []);
assert.deepEqual(newlyDone([half], [{ ...done, due: null }], stocked), []);

assert.deepEqual(lapsed([half], [{ ...half, id: "q2", due: null }]).map((q) => q.id), ["q1"]);
assert.deepEqual(lapsed([half], [done]), []);

console.log("jobs checks passed");
