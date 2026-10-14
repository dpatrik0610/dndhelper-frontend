// Self-check: npx esbuild src/utils/hp.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { defaultCharacter } from "@appTypes/Character/DefaultCharacter";
import { applyHp } from "./hp";

const c = { ...defaultCharacter, hitPoints: 10, maxHitPoints: 20, temporaryHitPoints: 5, conditions: ["Concentrating: Bless"] };

assert.equal(applyHp(c, 4).patch.hitPoints, 14, "heals");
assert.equal(applyHp(c, 50).patch.hitPoints, 20, "heal caps at max HP");
assert.equal(applyHp({ ...c, hitPoints: 25 }, 3).patch.hitPoints, 25, "healing never lowers HP above max");
const up = applyHp({ ...c, hitPoints: -4, deathSavesFailures: 2 }, 3).patch;
assert.equal(up.hitPoints, 3, "healing starts from 0");
assert.equal(up.deathSavesFailures, 0, "healing from 0 ends dying");

const hit = applyHp(c, -8);
assert.deepEqual([hit.patch.hitPoints, hit.patch.temporaryHitPoints], [7, 0], "damage eats temp HP first");
assert.match(hit.concentration ?? "", /DC 10/, "damage asks for the concentration save");
assert.equal(hit.patch.conditions.length, 1, "concentration kept until the save");

const down = applyHp(c, -30);
assert.equal(down.patch.hitPoints, -15, "damage can go below 0");
assert.deepEqual(down.patch.conditions, [], "0 HP ends concentration");
assert.equal(down.concentration, undefined);

console.log("hp checks passed");
