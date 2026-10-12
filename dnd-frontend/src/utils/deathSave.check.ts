// Self-check: npx esbuild src/utils/deathSave.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { deathSave } from "./deathSave";

const at = (deathSavesSuccesses: number, deathSavesFailures: number) => ({ deathSavesSuccesses, deathSavesFailures });

assert.deepEqual(deathSave(20, at(1, 2)).patch, { deathSavesSuccesses: 0, deathSavesFailures: 0, hitPoints: 1 });
assert.deepEqual(deathSave(10, at(0, 0)).patch, { deathSavesSuccesses: 1 });
assert.deepEqual(deathSave(15, at(2, 1)).patch, { deathSavesSuccesses: 0, deathSavesFailures: 0 });
assert.deepEqual(deathSave(9, at(0, 0)).patch, { deathSavesFailures: 1 });
assert.deepEqual(deathSave(1, at(0, 0)).patch, { deathSavesFailures: 2 });
assert.deepEqual(deathSave(1, at(0, 2)).patch, { deathSavesFailures: 3 });
assert.equal(deathSave(5, at(0, 2)).color, "red");
assert.deepEqual(deathSave(5, {}).patch, { deathSavesFailures: 1 });

console.log("death save checks passed");
