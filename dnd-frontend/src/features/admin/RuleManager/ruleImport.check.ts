// Self-check for ruleImport. Run: see .claude/skills/verify/run.sh (esbuild bundle | node)
import assert from "node:assert/strict";
import { onlyNew, ruleKey, toRuleInput } from "./ruleImport.ts";

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

assert.equal(ruleKey("Hiding & stealth"), ruleKey("hiding-and-stealth"));
const rule = (title: string) => ({ title, category: "Core", tags: [], content: "", source: "" });
assert.deepEqual(
  onlyNew([rule("Cover"), rule("Hiding and Stealth"), rule("Blinded"), rule("blinded")], [{ title: "Hiding & stealth", slug: "hiding-stealth" }, { title: "Total cover", slug: "cover" }]).map((r) => r.title),
  ["Blinded"],
);

console.log("ruleImport ok");
