import { type Spell } from "../../types/Spell";

export const mockSpell: Spell = {
  index: "fireball",
  name: "Fireball",
  description: [
    "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.",
    "Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.",
    "The fire spreads around corners. It ignites flammable objects in the area that aren't being worn or carried."
  ],
  higher_level: [
    "When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd."
  ],
  range: "150 feet",
  components: ["V", "S", "M"],
  material: "A tiny ball of bat guano and sulfur",
  ritual: false,
  duration: "Instantaneous",
  concentration: false,
  casting_time: "1 action",
  level: 3,
  attack_type: "ranged",
  damage: {
    damage_type: {
      name: "Fire"
    },
    damage_at_slot_level: {
      "3": "8d6",
      "4": "9d6",
      "5": "10d6",
      "6": "11d6",
      "7": "12d6",
      "8": "13d6",
      "9": "14d6"
    }
  },
  dc: {
    dc_type: {
      name: "DEX"
    },
    dc_success: "half"
  },
  area_of_effect: {
    type: "sphere",
    size: 20
  },
  school: {
    name: "Evocation"
  },
  classes: [
    { name: "Sorcerer" },
    { name: "Wizard" }
  ],
  subclasses: [
    { name: "Lore" },
    { name: "Fiend" }
  ],
  spell_url: "https://www.dnd5eapi.co/api/2014/spells/fireball"
};

// Additional mock spells for testing variety
export const mockSpells: Spell[] = [
  mockSpell,
  {
    index: "cure-wounds",
    name: "Cure Wounds",
    desc: [
      "A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs."
    ],
    higher_level: [
      "When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st."
    ],
    range: "Touch",
    components: ["V", "S"],
    ritual: false,
    duration: "Instantaneous",
    concentration: false,
    casting_time: "1 action",
    level: 1,
    heal_at_slot_level: {
      "1": "1d8 + MOD",
      "2": "2d8 + MOD",
      "3": "3d8 + MOD",
      "4": "4d8 + MOD",
      "5": "5d8 + MOD"
    },
    school: {
      name: "Evocation"
    },
    classes: [
      { name: "Bard" },
      { name: "Cleric" },
      { name: "Druid" },
      { name: "Paladin" },
      { name: "Ranger" }
    ],
    subclasses: [
      { name: "Lore" },
      { name: "Life" }
    ],
    spell_url: "https://www.dnd5eapi.co/api/2014/spells/cure-wounds"
  },
  {
    index: "mage-armor",
    name: "Mage Armor",
    desc: [
      "You touch a willing creature who isn't wearing armor, and a protective magical force surrounds it until the spell ends.",
      "The target's base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action."
    ],
    higher_level: [],
    range: "Touch",
    components: ["V", "S", "M"],
    material: "A piece of cured leather",
    ritual: false,
    duration: "8 hours",
    concentration: false,
    casting_time: "1 action",
    level: 1,
    school: {
      name: "Abjuration"
    },
    classes: [
      { name: "Wizard" }
    ],
    subclasses: [
      { name: "Lore" }
    ],
    spell_url: "https://www.dnd5eapi.co/api/2014/spells/mage-armor"
  },
  {
    index: "guidance",
    name: "Guidance",
    desc: [
      "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends."
    ],
    higher_level: [],
    range: "Touch",
    components: ["V", "S"],
    ritual: false,
    duration: "Up to 1 minute",
    concentration: true,
    casting_time: "1 action",
    level: 0,
    school: {
      name: "Divination"
    },
    classes: [
      { name: "Cleric" },
      { name: "Druid" }
    ],
    subclasses: [],
    spell_url: "https://www.dnd5eapi.co/api/2014/spells/guidance"
  },
  {
    index: "shield",
    name: "Shield",
    desc: [
      "An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile."
    ],
    higher_level: [],
    range: "Self",
    components: ["V", "S"],
    ritual: false,
    duration: "1 round",
    concentration: false,
    casting_time: "1 reaction",
    level: 1,
    school: {
      name: "Abjuration"
    },
    classes: [
      { name: "Sorcerer" },
      { name: "Wizard" }
    ],
    subclasses: [
      { name: "Lore" }
    ],
    spell_url: "https://www.dnd5eapi.co/api/2014/spells/shield"
  }
];