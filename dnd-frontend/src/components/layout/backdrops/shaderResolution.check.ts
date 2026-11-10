import assert from "node:assert/strict";
import { shaderResolution } from "./shaderResolution";

const size = (width: number, height: number, density = 1, scale = 1) =>
  shaderResolution(width, height, scale, density, 8192, 8192);

assert.deepEqual(size(1920, 1080), { width: 1920, height: 1080 });
for (const zoom of [0.5, 0.8, 1, 1.25, 1.5, 2, 3]) {
  const result = size(1920 / zoom, 1080 / zoom, zoom);
  assert.ok(result.width >= 1920 && result.height >= 1080, `quality lost at ${zoom * 100}% zoom`);
}
assert.deepEqual(size(1920, 1080, 2), { width: 3840, height: 2160 });
assert.deepEqual(size(1000, 500, 1, 0.34), { width: 340, height: 170 });
assert.deepEqual(shaderResolution(4000, 2000, 1, 3, 4096, 2048), { width: 4096, height: 2048 });
assert.deepEqual(size(0, 0), { width: 1, height: 1 });
console.log("Shader resolution checks passed");
