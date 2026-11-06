// Self-check: npx esbuild src/features/bardify/sync.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { clock, EASE, gainOf, positionAt } from "./sync";

assert.equal(positionAt({ playing: true, startedAt: 10_000, position: 99 }, 12_500), 2.5);
assert.equal(positionAt({ playing: true, startedAt: 10_000, position: 0 }, 9_000), -1);
assert.equal(positionAt({ playing: false, startedAt: 10_000, position: 42 }, 99_999), 42);

assert.equal(gainOf(0), 0);
assert.equal(gainOf(1), 1);
assert.ok(Math.abs(gainOf(0.5) - 0.1) < 1e-9);

for (const ease of Object.values(EASE)) {
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
}
assert.equal(EASE.inOut(0.5), 0.5);

assert.equal(clock(-3), "0:00");
assert.equal(clock(65.9), "1:05");
assert.equal(clock(3725), "1:02:05");

console.log("bardify sync checks passed");
