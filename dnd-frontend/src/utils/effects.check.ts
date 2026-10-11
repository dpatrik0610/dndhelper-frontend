// Self-check: npx esbuild src/utils/effects.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { defaultCharacter } from "@appTypes/Character/DefaultCharacter";
import { computeEffects, detectModifiers, situationsOf, syncEquippedEffects, wornInventoryId } from "./effects";
import { passChance, physicalLimits } from "./checkMath";

const detect = (name: string, ...description: string[]) => detectModifiers({ name, description });

assert.deepEqual(detect("Plate Armor"), [{ target: "skill:Stealth", type: "disadvantage" }]);
assert.deepEqual(detect("Great Restoration Necklace", "While worn, it grants +2 CON."), [{ target: "con", type: "bonus", value: 2 }]);
assert.deepEqual(detect("Amulet of Health", "Your Constitution score is 19 while you wear this amulet."), [{ target: "con", type: "min", value: 19 }]);
assert.deepEqual(detect("Ring of Protection", "You gain a +1 bonus to AC and saving throws while wearing this ring."), [
  { target: "ac", type: "bonus", value: 1 },
  { target: "saves", type: "bonus", value: 1 },
]);
assert.deepEqual(detect("Boots", "You have disadvantage on Dexterity (Stealth) checks and your speed increases by 10 feet."), [
  { target: "speed", type: "bonus", value: 10 },
  { target: "skill:Stealth", type: "disadvantage" },
]);
assert.deepEqual(detect("Tonic", "+2 bonus to Constitution saving throws."), [{ target: "save:con", type: "bonus", value: 2 }]);
assert.deepEqual(detect("Charm", "+1 bonus to saving throws against being charmed for 1 hour."), [], "situational bonuses are skipped");
assert.deepEqual(detect("Greataxe", "Small creatures have disadvantage on attack rolls with heavy weapons."), []);
assert.deepEqual(detect("Salve", "It removes the disadvantage on attack rolls."), []);
assert.deepEqual(detect("Potion of Climbing", "When you drink this potion, you have advantage on Strength (Athletics) checks for 1 hour."), [
  { target: "skill:Athletics", type: "advantage" },
]);
assert.deepEqual(detect("Boots", "Adds +5 movement speed."), [{ target: "speed", type: "bonus", value: 5 }]);
assert.deepEqual(detect("Ring of Acid", "You have resistance to acid damage."), [{ target: "", type: "note", text: "Resistance to acid damage" }]);
assert.deepEqual(detect("+1 Chain Mail"), [
  { target: "skill:Stealth", type: "disadvantage" },
  { target: "ac", type: "bonus", value: 1 },
]);

const character = {
  ...defaultCharacter,
  abilityScores: { ...defaultCharacter.abilityScores, con: 14, dex: 12 },
  savingThrows: { ...defaultCharacter.savingThrows, constitution: 2 },
  skills: defaultCharacter.skills.map((s) => (s.name === "Stealth" ? { ...s, value: 1 } : s)),
  level: 3,
  maxHitPoints: 24,
  speed: 30,
  conditions: ["Restrained"],
  effects: [
    { id: "1", name: "Great Restoration Necklace", source: "item" as const, active: true, modifiers: [{ target: "con", type: "bonus" as const, value: 2 }] },
    { id: "2", name: "Plate Armor", source: "item" as const, active: true, modifiers: [{ target: "skill:Stealth", type: "disadvantage" as const }] },
    { id: "3", name: "Boots of Speed", source: "item" as const, active: true, modifiers: [{ target: "speed", type: "bonus" as const, value: 10 }] },
    { id: "4", name: "Unequipped Belt", source: "item" as const, active: false, modifiers: [{ target: "str", type: "min" as const, value: 21 }] },
  ],
};
const { stats } = computeEffects(character);

assert.equal(stats.con.value, 16);
assert.equal(stats.con.base, 14, "base is untouched");
assert.equal(character.abilityScores.con, 14, "character is untouched");
assert.equal(stats["save:con"].value, 3, "CON mod +2 -> +3 carries into the save");
assert.equal(stats.maxHp.value, 27, "+1 CON mod over 3 levels");
assert.equal(stats["skill:Stealth"].roll, "disadvantage");
assert.equal(stats["skill:Stealth"].why[0].source, "Plate Armor");
assert.equal(stats["save:dex"].roll, "disadvantage", "restrained");
assert.equal(stats.speed.value, 0, "restrained sets speed 0 over the boots");
assert.equal(stats.str.value, 10, "inactive effects do nothing");
assert.equal(stats["passive:Perception"].value, 10);

const manual = { id: "m", name: "Ring", source: "item" as const, equipmentId: "ring", active: true, modifiers: [] };
const plateFx = syncEquippedEffects([manual], [
  { equipmentId: "plate", name: "Plate Armor" },
  { equipmentId: "ring", name: "Ring" },
  { equipmentId: "pot", name: "Potion of Healing" },
])!;
assert.equal(plateFx.length, 2, "plate added, ring kept as-is, potion skipped");
assert.deepEqual(plateFx[1].modifiers, [{ target: "skill:Stealth", type: "disadvantage" }]);
assert.equal(plateFx[1].auto, true);
assert.equal(syncEquippedEffects(plateFx, [{ equipmentId: "plate", name: "Plate Armor" }, { equipmentId: "ring", name: "Ring" }]), null, "no change");
const off = plateFx.map((e) => ({ ...e, active: false }));
assert.equal(syncEquippedEffects(off, [{ equipmentId: "plate", name: "Plate Armor" }]), null, "a switched-off effect is not switched back on");
assert.deepEqual(syncEquippedEffects(plateFx, [])!.map((e) => e.id), ["m"], "plate left: its auto effect goes, the manual one stays");

const boots = {
  ...defaultCharacter,
  speed: 30,
  effects: [{
    id: "b", name: "Bog Boots", source: "item" as const, active: true,
    modifiers: [
      { target: "speed", type: "bonus" as const, value: -10, when: "Swamp" },
      { target: "speed", type: "bonus" as const, value: 10, when: "Desert" },
    ],
  }],
};
assert.equal(computeEffects(boots).stats.speed.value, 30, "no situation on: neither applies");
assert.equal(computeEffects({ ...boots, activeSituations: ["swamp"] }).stats.speed.value, 20, "matched without case");
assert.equal(computeEffects({ ...boots, activeSituations: ["Desert"] }).stats.speed.value, 40);
assert.deepEqual(situationsOf({ ...boots, activeSituations: ["Raging"] }), ["Swamp", "Desert", "Raging"]);

assert.deepEqual(detect("Sage's Circlet", "You gain proficiency in Wisdom saving throws and the Insight skill."), [
  { target: "save:wis", type: "proficiency" },
  { target: "skill:Insight", type: "proficiency" },
]);
assert.deepEqual(detect("Gauntlets", "While wearing these, you have proficiency with heavy armor."), [
  { target: "", type: "proficiency", text: "Heavy armor" },
]);
assert.deepEqual(detect("Tome", "You gain proficiency in two skills of your choice."), [], "a choice is the player's to make");

const learner = {
  ...defaultCharacter,
  proficiencyBonus: 3,
  abilityScores: { ...defaultCharacter.abilityScores, wis: 14, dex: 16 },
  savingThrows: { ...defaultCharacter.savingThrows, wisdom: 2, dexterity: 6 },
  skills: defaultCharacter.skills.map((s) => (s.name === "Insight" ? { ...s, value: 2 } : s.name === "Stealth" ? { ...s, value: 6, proficient: true } : s)),
  effects: [{
    id: "p", name: "Sage's Circlet", source: "item" as const, active: true,
    modifiers: [
      { target: "save:wis", type: "proficiency" as const },
      { target: "save:wis", type: "proficiency" as const },
      { target: "save:dex", type: "proficiency" as const },
      { target: "skill:Insight", type: "proficiency" as const },
      { target: "skill:Stealth", type: "proficiency" as const },
      { target: "", type: "proficiency" as const, text: "Thieves' tools" },
    ],
  }],
};
const lfx = computeEffects(learner);
assert.equal(lfx.stats["save:wis"].value, 5, "+PB once, never twice");
assert.equal(lfx.stats["save:wis"].proficient, true);
assert.equal(lfx.stats["save:dex"].value, 6, "already proficient (3 DEX + 3 PB): no change");
assert.equal(lfx.stats["skill:Insight"].value, 5);
assert.equal(lfx.stats["skill:Stealth"].value, 6, "skill already proficient");
assert.equal(lfx.stats["passive:Insight"].value, 13, "passive follows the skill");
assert.deepEqual(lfx.proficiencies, [{ source: "Sage's Circlet", detail: "Thieves' tools" }]);

const bags = [{ id: "a", name: "Backpack" }, { id: "b", name: "Aria's Equipment" }];
assert.equal(wornInventoryId(undefined, bags), "b", "guessed from the name");
assert.equal(wornInventoryId("a", bags), "a", "the pick wins");
assert.equal(wornInventoryId("none", bags), undefined, "chose nothing");
assert.equal(wornInventoryId("gone", bags), "b", "a pick that left the character falls back");
assert.equal(wornInventoryId(undefined, [{ id: "c", name: "Equipment Shop Stock" }]), undefined);

assert.equal(passChance(5, 15), 0.55, "needs a 10+");
assert.equal(passChance(5, 15, "advantage").toFixed(4), "0.7975");
assert.equal(passChance(5, 15, "disadvantage").toFixed(4), "0.3025");
assert.equal(passChance(10, 5), 1, "can't fail");
assert.equal(passChance(0, 25), 0, "no auto-success on a 20");
assert.deepEqual(physicalLimits(16, 14, "Large"), { carry: 480, pushDragLift: 960, longJump: 16, highJump: 6, breathMinutes: 3 });
assert.equal(physicalLimits(10, 6).breathMinutes, 0.5, "never under 30 seconds");

console.log("effects self-check passed");
