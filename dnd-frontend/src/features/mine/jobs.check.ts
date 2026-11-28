// Self-check: bunx esbuild src/features/mine/jobs.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import type { MiningQuest } from "@services/miningService";
import { clock, lapsed, limitText, msLeft, opensIn, newlyDone, questDone, questProgress, shortOf } from "./jobs";

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
assert.equal(questDone(half), false);
assert.equal(questProgress(half), (1 + 1 + 0.5) / 3);
assert.deepEqual(shortOf(half, { iron: 25, rimebronze: 1 }), [["rimebronze", 3]]);

const done = quest({ needs: half.needs.map((n) => ({ ...n, done: n.count })) });
assert.deepEqual(newlyDone([half], [done]).map((q) => q.id), ["q1"]);
assert.deepEqual(newlyDone([done], [done]), []);
assert.deepEqual(newlyDone([half], [{ ...done, due: null }]), []);

assert.deepEqual(lapsed([half], [{ ...half, id: "q2", due: null }]).map((q) => q.id), ["q1"]);
assert.deepEqual(lapsed([half], [done]), []);

console.log("jobs checks passed");
