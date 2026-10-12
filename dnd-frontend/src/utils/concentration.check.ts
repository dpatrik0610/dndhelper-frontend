// Self-check: npx esbuild src/utils/concentration.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { addCondition, concentrationDc, isConcentration, savePassed } from "./concentration";

assert.equal(concentrationDc(7), 10);
assert.equal(concentrationDc(25), 12);
assert.equal(concentrationDc(40), 20);

assert.ok(isConcentration("Concentrating: Bless"));
assert.ok(isConcentration(" concentration"));
assert.ok(!isConcentration("Poisoned"));

const id = (s: string) => s;
assert.deepEqual(addCondition(["Poisoned", "Concentrating: Bless"], "Concentrating: Haste", id), ["Poisoned", "Concentrating: Haste"]);
assert.deepEqual(addCondition(["Concentrating: Bless"], "Prone", id), ["Concentrating: Bless", "Prone"]);

assert.ok(savePassed([10], 10));
assert.ok(!savePassed([9], 10));
assert.ok(savePassed([4, 15], 12, "advantage"));
assert.ok(!savePassed([4, 15], 12, "disadvantage"));

console.log("concentration checks passed");
