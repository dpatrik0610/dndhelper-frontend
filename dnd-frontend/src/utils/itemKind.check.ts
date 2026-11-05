// Self-check: npx esbuild src/utils/itemKind.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { itemKind } from "@utils/itemKind";

const cases: [Parameters<typeof itemKind>[0], ReturnType<typeof itemKind>][] = [
  [{ name: "Potion of Healing" }, "potion"],
  [{ name: "Longsword" }, "weapon"],
  [{ name: "Light Crossbow" }, "ranged"],
  [{ name: "Arrows (20)" }, "ammo"],
  [{ name: "Chain Mail" }, "armor"],
  [{ name: "Ring Mail" }, "armor"],
  [{ name: "Ring of Protection" }, "jewelry"],
  [{ name: "Staff of Fire" }, "arcane"],
  [{ name: "Quarterstaff" }, "weapon"],
  [{ name: "Thieves' Tools" }, "tool"],
  [{ name: "Boots of Elvenkind" }, "clothing"],
  [{ name: "Spell Scroll" }, "scroll"],
  [{ name: "Rations (1 day)" }, "food"],
  [{ name: "Bag of Holding" }, "container"],
  [{ name: "Torch" }, "light"],
  [{ name: "Flame Tongue", damage: { damageDice: "1d8" } }, "weapon"],
  [{ name: "Oathbow", damage: { damageDice: "1d8" }, range: { long: 600 } }, "ranged"],
  [{ name: "Mysterious Thing", tags: ["Potion"] }, "potion"],
  [{ name: "Mysterious Thing" }, "gear"],
  [{}, "gear"],
];

for (const [item, expected] of cases) {
  assert.equal(itemKind(item), expected, `${item.name ?? "(no name)"} should be ${expected}`);
}

console.log("itemKind checks passed");
