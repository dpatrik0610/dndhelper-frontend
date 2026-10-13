// Self-check: npx esbuild src/features/characterForm/components/clampCounter.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { clampCounter } from "./clampCounter";

assert.deepEqual(clampCounter({ current: 5, max: 3 }), { current: 3, max: 3 }, "current capped at max");
assert.deepEqual(clampCounter({ current: -2, max: 3 }), { current: 0, max: 3 }, "current floored at 0");
assert.deepEqual(clampCounter({ current: 2, max: -1 }), { current: 0, max: 0 }, "max floored at 0, current follows");
assert.deepEqual(clampCounter({ level: 1, current: 1, max: 2 }), { level: 1, current: 1, max: 2 }, "extra fields kept");
console.log("clampCounter ok");
