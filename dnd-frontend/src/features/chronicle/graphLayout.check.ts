// Self-check for graphLayout. Run: see .claude/skills/verify/run.sh (esbuild bundle | node)
import assert from "node:assert/strict";
import { layoutGraph } from "./graphLayout.ts";

assert.equal(layoutGraph([], []).size, 0);
assert.deepEqual(layoutGraph(["solo"], [], 400, 300).get("solo"), {
  x: 200,
  y: 150,
});

const ids = Array.from({ length: 12 }, (_, i) => `n${i}`);
const edges: [string, string][] = [
  ["n0", "n1"],
  ["n1", "n2"],
  ["n2", "n0"],
  ["n3", "n4"],
  ["n0", "ghost"],
  ["n5", "n5"],
];
const first = layoutGraph(ids, edges, 800, 600);
const again = layoutGraph(ids, edges, 800, 600);
assert.deepEqual([...first.entries()], [...again.entries()], "deterministic");

for (const [id, p] of first) {
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), `${id} finite`);
  assert.ok(
    p.x >= 20 && p.x <= 780 && p.y >= 20 && p.y <= 580,
    `${id} inside the box`,
  );
}

const dist = (a: string, b: string) =>
  Math.hypot(
    first.get(a)!.x - first.get(b)!.x,
    first.get(a)!.y - first.get(b)!.y,
  );
const linked = (dist("n0", "n1") + dist("n1", "n2") + dist("n3", "n4")) / 3;
const unlinked = (dist("n0", "n7") + dist("n3", "n9") + dist("n2", "n10")) / 3;
assert.ok(
  linked < unlinked,
  `linked notes sit closer (${linked.toFixed(0)} < ${unlinked.toFixed(0)})`,
);

console.log("graphLayout ok");
