// Self-check: npx esbuild src/features/admin/InventoryDashboard/components/equipmentFilter.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { EMPTY_FILTERS, filterEquipment, isFiltered } from "./equipmentFilter";

const item = (name: string, extra: Partial<Equipment> = {}): Equipment => ({
  index: name.toLowerCase().replace(/ /g, "-"),
  name,
  isCustom: false,
  isDeleted: false,
  ...extra,
});

const items = [
  item("Longsword", { tags: ["weapon"], cost: { quantity: 15, unit: "gp" } }),
  item("Dagger", { tags: ["weapon"], cost: { quantity: 2, unit: "gp" } }),
  item("Flame Tongue", { tier: "Rare", tags: ["weapon", "magic"], isCustom: true, cost: { quantity: 500, unit: "gp" } }),
  item("Potion of Healing", { tier: "Uncommon", tags: ["potion"], cost: { quantity: 50, unit: "gp" } }),
  item("Old Rope", { isDeleted: true }),
];
const names = (f: Partial<typeof EMPTY_FILTERS>) => filterEquipment(items, { ...EMPTY_FILTERS, ...f }).map((e) => e.name);

assert.deepEqual(names({}), ["Dagger", "Flame Tongue", "Longsword", "Potion of Healing"], "deleted hidden, name order");
assert.deepEqual(names({ query: "POTION" }), ["Potion of Healing"]);
assert.deepEqual(names({ query: "magic" }), ["Flame Tongue"], "query matches tags");
assert.deepEqual(names({ query: "long" }), ["Longsword"], "query matches index");
assert.deepEqual(names({ tiers: ["Common"] }), ["Dagger", "Longsword"], "missing tier counts as Common");
assert.deepEqual(names({ tiers: ["Rare", "Uncommon"] }), ["Flame Tongue", "Potion of Healing"]);
assert.deepEqual(names({ tags: ["potion", "magic"] }), ["Flame Tongue", "Potion of Healing"], "tags match any");
assert.deepEqual(names({ customOnly: true }), ["Flame Tongue"]);
assert.deepEqual(names({ sort: "tier" }), ["Dagger", "Longsword", "Potion of Healing", "Flame Tongue"]);
assert.deepEqual(names({ sort: "cost" }), ["Dagger", "Longsword", "Potion of Healing", "Flame Tongue"]);
assert.equal(isFiltered(EMPTY_FILTERS), false);
assert.equal(isFiltered({ ...EMPTY_FILTERS, sort: "cost" }), false, "sort alone is not a filter");
assert.equal(isFiltered({ ...EMPTY_FILTERS, query: "  " }), false);
assert.equal(isFiltered({ ...EMPTY_FILTERS, customOnly: true }), true);
console.log("equipmentFilter ok");
