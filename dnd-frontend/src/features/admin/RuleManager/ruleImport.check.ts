// Self-check for ruleImport. Run: see .claude/skills/verify/run.sh (esbuild bundle | node)
import assert from "node:assert/strict";
import { toRuleInput } from "./ruleImport.ts";

assert.deepEqual(toRuleInput({ title: " Cover ", category: "Combat", tags: ["ac", " "], content: "**+2** AC", source: "PHB p.196" }), {
  title: "Cover",
  category: "Combat",
  tags: ["ac"],
  content: "**+2** AC",
  source: "PHB p.196",
});

assert.deepEqual(
  toRuleInput({ title: "Resting", summary: "Short and long.", body: ["Short and long.", "Long rest is 8 hours."], source: { title: "SRD", page: "21" } }),
  { title: "Resting", category: "General", tags: [], content: "Short and long.\n\nLong rest is 8 hours.", source: "SRD p.21" },
);

assert.equal(toRuleInput({ category: "Combat" }), null);
assert.equal(toRuleInput("nope"), null);

console.log("ruleImport ok");
