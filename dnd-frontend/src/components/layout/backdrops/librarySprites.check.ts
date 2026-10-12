// Self-check: npx esbuild src/components/layout/backdrops/librarySprites.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { pixels } from "@utils/pixelArt";
import { SPRITES } from "./librarySprites";

assert.deepEqual(pixels(["K.", ".k"], { K: "#000", k: "#111" }), [
  { x: 0, y: 0, color: "#000" },
  { x: 1, y: 1, color: "#111" },
]);
assert.throws(() => pixels(["Z"], {}), /no colour/);

// Every sprite: all frames the same size, every row the same width, every character has a colour.
for (const [name, { frames, palette }] of Object.entries(SPRITES)) {
  const h = frames[0].length;
  const w = frames[0][0].length;
  frames.forEach((rows, f) => {
    assert.equal(rows.length, h, `${name} frame ${f}: ${rows.length} rows, expected ${h}`);
    rows.forEach((row, y) => assert.equal(row.length, w, `${name} frame ${f} row ${y}: width ${row.length}, expected ${w}`));
    pixels(rows, palette);
  });
}

console.log("library sprite checks passed");
