// Self-check: npx esbuild src/utils/hitDice.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { classHitDice, classSummary, formatPool, hitDicePool, mainClassLevel, shortRest } from "./hitDice";

assert.deepEqual(hitDicePool({ hitDice: "1d8 + 2D10+d8", hitDiceSpent: { d10: 1 } }), [
  { die: "d10", sides: 10, total: 2, left: 1 },
  { die: "d8", sides: 8, total: 2, left: 2 },
]);
assert.deepEqual(hitDicePool({ hitDice: "" }), []);
assert.equal(formatPool(hitDicePool({ hitDice: "1d10+1d8", hitDiceSpent: { d8: 5 } })), "1d10 + 0d8");

const c = {
  hitDice: "1d10+1d8",
  hitDiceSpent: { d10: 1 },
  hitPoints: 5,
  classResources: [
    { name: "Ki", current: 0, max: 4, recharge: "short" as const },
    { name: "Rage", current: 0, max: 3, recharge: "long" as const },
  ],
};
// d10 already spent, so only the d8 rolls; asking for 3 d8 spends just the one left.
const r = shortRest(c, { d10: 1, d8: 3 }, 2, 30, (sides) => sides);
assert.deepEqual(r.rolls, [{ die: "d8", roll: 8 }]);
assert.equal(r.healed, 10);
assert.deepEqual(r.patch.hitDiceSpent, { d10: 1, d8: 1 });
assert.deepEqual(r.patch.classResources.map((x) => x.current), [4, 0]);

assert.equal(shortRest(c, { d8: 1 }, 2, 8, () => 8).patch.hitPoints, 8, "capped at max HP");
assert.equal(shortRest(c, { d8: 1 }, -5, 30, () => 1).healed, 0, "a die never heals below 0");
const down = shortRest({ ...c, hitPoints: -3 }, { d8: 1 }, 0, 30, () => 4);
assert.equal(down.patch.hitPoints, 4, "heals from 0");
assert.equal(down.patch.deathSavesFailures, 0);
assert.deepEqual(shortRest(c, {}, 2, 30).patch.hitDiceSpent, { d10: 1 }, "resting without dice still refills resources");

const fighter = { level: 5, hitDie: 10, isMulticlass: true, multiclasses: [{ name: "Wizard", level: 2, hitDie: 6 }] };
assert.equal(mainClassLevel(fighter), 3);
assert.equal(classHitDice(fighter), "3d10 + 2d6");
assert.equal(classHitDice({ ...fighter, isMulticlass: false }), "5d10", "toggle off ignores the extra classes");
assert.equal(classHitDice({ ...fighter, hitDie: null }), undefined, "older characters keep their typed hit dice");
assert.equal(classHitDice({ ...fighter, multiclasses: [{ name: "Wizard", level: 5, hitDie: 6 }] }), "5d6", "a main class with no levels left adds nothing");
assert.deepEqual(hitDicePool({ hitDice: classHitDice(fighter)! }).map((d) => d.total), [3, 2]);

assert.equal(classSummary({ ...fighter, characterClass: "Fighter" }), "Fighter 3 / Wizard 2");
assert.equal(classSummary({ ...fighter, characterClass: "Fighter", isMulticlass: false }), "Fighter");
assert.equal(classSummary({ ...fighter, characterClass: "Fighter", multiclasses: [{ name: " ", level: 1, hitDie: 6 }] }), "Fighter", "unnamed rows are left out");

console.log("hit dice checks passed");
