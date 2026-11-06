// Self-check for chronicleLinks. Run: see .claude/skills/verify/run.sh (esbuild bundle | node)
import assert from "node:assert/strict";
import {
  backlinks,
  decodeNewLink,
  linkEdges,
  outgoing,
  parseLinks,
  parseOutline,
  plainText,
  titleIndex,
  toMarkdown,
  wordCount,
  NEW_LINK,
} from "./chronicleLinks.ts";

const e = (id: string, title: string, content = "") => ({ id, title, content });

assert.deepEqual(parseLinks("See [[Waterdeep]] and [[ Volo | the bard ]]."), [
  { target: "Waterdeep", alias: null },
  { target: "Volo", alias: "the bard" },
]);
assert.deepEqual(parseLinks("[[broken\n]] [single] [[]]"), []);

const a = e(
  "a",
  "Waterdeep",
  "Home of [[volo]] and [[Volo|him]], also [[Nowhere]] and [[Waterdeep]].",
);
const b = e("b", "Volo", "Lives in [[Waterdeep]].");
const c = e("c", "Lonely");
const dup = e("d", "volo");
const all = [a, b, c, dup];
const index = titleIndex(all);

assert.deepEqual(
  outgoing(a, index).map((x) => x.id),
  ["b"],
  "case-insensitive, deduped, no self, first title wins",
);
assert.deepEqual(
  backlinks(b, all, index).map((x) => x.id),
  ["a"],
);
assert.deepEqual(backlinks(c, all, index), []);
assert.deepEqual(linkEdges(all, index), [["a", "b"]], "a<->b counted once");

const dm = toMarkdown(
  "Go to [[Volo|the bard]] or [[New (Place)]].",
  index,
  true,
);
assert.equal(
  dm,
  `Go to [the bard](#chronicle/b) or [New (Place)](${NEW_LINK}New%20%28Place%29).`,
);
assert.equal(decodeNewLink(`${NEW_LINK}New%20%28Place%29`), "New (Place)");
assert.equal(
  toMarkdown("Go to [[Nowhere]].", index, false),
  "Go to Nowhere.",
  "players never see create links",
);

assert.equal(toMarkdown("A %%secret [[Volo]]%% B", index, false), "A  B");
assert.equal(
  toMarkdown("A %%hidden forever", index, false),
  "A ",
  "unclosed secret hides the rest, like the server",
);
assert.equal(toMarkdown("A %%psst%% B", index, true), "A _(DM only: psst)_ B");
assert.ok(
  toMarkdown("%%line1\nline2%%", index, true).includes(
    "> **DM only**\n> line1\n> line2",
  ),
);
assert.equal(
  toMarkdown("[[a]b]]", index, true),
  "[[a]b]]",
  "brackets inside a target don't parse",
);

const doc = toMarkdown(
  "# Waterdeep\nText\n## The [[Volo|bard]] **himself** ##\n```\n# not a heading\n```\n#### too deep\n#nospace",
  index,
  true,
);
assert.deepEqual(parseOutline(doc), [
  { level: 1, text: "Waterdeep" },
  { level: 2, text: "The bard himself" },
]);
assert.equal(plainText("a [x](#chronicle/b) \\[y\\] `z`"), "a x [y] z");
assert.equal(wordCount("Hello **brave** world - [[x]]\n\n- one"), 5);

console.log("chronicleLinks ok");
