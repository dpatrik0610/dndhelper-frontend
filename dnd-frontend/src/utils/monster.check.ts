// Self-check: npx esbuild src/utils/monster.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { abilityMod, bonusList, crLabel, crXp, proficiencyBonus, speedText, ABILITY_KEYS } from "./monster";

assert.equal(abilityMod(10), 0);
assert.equal(abilityMod(8), -1);
assert.equal(abilityMod(27), 8);

assert.equal(proficiencyBonus(0.25), 2);
assert.equal(proficiencyBonus(4), 2);
assert.equal(proficiencyBonus(5), 3);
assert.equal(proficiencyBonus(17), 6);
assert.equal(proficiencyBonus(30), 9);

assert.equal(crXp(0.25), 50);
assert.equal(crXp(17), 18000);
assert.equal(crLabel(0.125), "1/8");
assert.equal(crLabel(0.5), "1/2");
assert.equal(crLabel(10), "10");

assert.equal(speedText({ walk: 40, climb: 40, fly: 80 }), "40 ft., climb 40 ft., fly 80 ft.");
assert.equal(speedText({ walk: 10, fly: 30, hover: true, swim: null }), "10 ft., fly 30 ft. (hover)");

assert.equal(bonusList({ con: 13, dex: 6 }, ABILITY_KEYS), "Dex +6, Con +13");
assert.equal(bonusList({ stealth: 6, perception: 13 }), "Perception +13, Stealth +6");

console.log("monster checks passed");
