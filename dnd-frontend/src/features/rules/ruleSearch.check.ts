// Self-check for ruleSearch. Run: see .claude/skills/verify/run.sh (esbuild bundle | node)
import assert from "node:assert/strict";
import { excerpt, parseQuery, plainText, searchRules } from "./ruleSearch.ts";

assert.deepEqual(parseQuery('cover tag:combat #reaction cat:"core rules" "bonus action"'), {
  terms: ["cover", "bonus action"],
  tags: ["combat", "reaction"],
  categories: ["core rules"],
});
assert.deepEqual(parseQuery("  "), { terms: [], tags: [], categories: [] });
assert.deepEqual(parseQuery("dc:15").terms, ["dc:15"]);

assert.equal(plainText("## Cover\n\n- **Half** cover: see [AC](#ac)"), "Cover Half cover: see AC");
assert.equal(excerpt("one two three four", 9), "one two…");

const rules = [
  { title: "Opportunity attacks", category: "Combat", tags: ["reaction"], content: "Leaving reach provokes." },
  { title: "Cover", category: "Combat", tags: ["positioning"], content: "Half cover gives +2 AC." },
  { title: "Concentration", category: "Magic", tags: ["spells"], content: "Taking damage from cover fire forces a save." },
  { title: "Resting", category: "Downtime", tags: [], content: "Short rest is one hour." },
];

assert.deepEqual(searchRules(rules, "").map((h) => h.rule.title), rules.map((r) => r.title));
assert.deepEqual(searchRules(rules, "cover").map((h) => h.rule.title), ["Cover", "Concentration"]);
assert.match(searchRules(rules, "cover")[1].snippet ?? "", /cover fire/);
assert.deepEqual(searchRules(rules, "cat:combat").map((h) => h.rule.title), ["Opportunity attacks", "Cover"]);
assert.deepEqual(searchRules(rules, "#reaction").map((h) => h.rule.title), ["Opportunity attacks"]);
assert.deepEqual(searchRules(rules, "cover cat:magic").map((h) => h.rule.title), ["Concentration"]);
assert.deepEqual(searchRules(rules, "cover nope"), []);

console.log("ruleSearch ok");
