import type { Character } from "./Character";
import type { Currency } from "../Currency";
import type { SavingThrows } from "./SavingThrows";
import type { AbilityScores } from "./AbilityScores";
import { HeightLabel } from "./HeightLabel";

const mockAbilityScores: AbilityScores = {
  str: 16,
  dex: 14,
  con: 15,
  int: 12,
  wis: 10,
  cha: 13,
};

const mockSavingThrows: SavingThrows = {
  strength: true,
  dexterity: false,
  constitution: false,
  intelligence: true,
  wisdom: false,
  charisma: true,
};

const mockCurrencies: Currency[] = [
  { type: "silver", amount: 32, currencyCode: "sp" },
  { type: "gold", amount: 110, currencyCode: "gp" },
];

export const mockCharacter: Character = {
  // METADATA
  id: "char-001",
  ownerId: "user-123",
  imageUrl: "https://example.com/character.jpg",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  // BASIC INFO
  name: "Thalion Dawnsworn",
  isDead: false,
  isNPC: false,
  race: "Half-Elf",
  characterClass: "Paladin",
  background: "Knight of the Order",
  level: 5,
  armorClass: 18,
  hitPoints: 36,
  maxHitPoints: 44,
  temporaryHitPoints: 0,
  speed: 30,
  initiative: 2,
  alignment: "Lawful Good",
  proficiencyBonus: 3,

  proficiencies: ["Athletics", "Persuasion", "Insight", "Intimidation"],
  languages: ["Common", "Elvish", "Celestial"],
  conditions: [],
  resistances: ["Radiant"],
  immunities: [],
  vulnerabilities: [],
  features: ["Divine Sense", "Lay on Hands", "Sacred Oath: Oath of Devotion"],
  actions: ["Longsword Attack", "Divine Smite", "Shield Bash"],
  spells: ["Bless", "Cure Wounds", "Shield of Faith", "Lesser Restoration"],
  currencies: mockCurrencies,

  // STATBLOCK
  abilityScores: mockAbilityScores,
  savingThrows: mockSavingThrows,
  inspiration: 1,
  skills: {
    Athletics: 5,
    Persuasion: 4,
    Intimidation: 4,
    Insight: 3,
    Perception: 2,
  },
  spellSaveDc: 13,
  spellAttackBonus: 5,
  deathSavesSuccesses: 0,
  deathSavesFailures: 0,
  passivePerception: 12,
  passiveInvestigation: 11,
  passiveInsight: 13,
  experience: 6500,
  carryingCapacity: 240,
  currentEncumbrance: 120,

  // FILLER
  backstory: [
    "Once a loyal squire of the Sunblade Order, Thalion earned his place as a knight through valor and faith.",
    "He now wanders to reclaim relics of the fallen temple of Aureon."
  ],
  size: HeightLabel.MEDIUM,
  age: 28,
  height: "5'11\"",
  weight: "175 lbs",
  eyes: "Emerald Green",
  skin: "Fair",
  hair: "Golden Blond",
  appearance: "Wears polished silver armor etched with sun motifs.",
  personalityTraits: "Courageous, unwavering in faith.",
  ideals: "Honor and compassion above all.",
  bonds: "Sworn to protect the weak and uphold the Sunblade’s creed.",
  flaws: "Sometimes blinded by his sense of duty.",
  notes: "Carries a sunburst pendant symbolizing his oath.",
  description: "A tall, radiant half-elf knight bearing divine light in his every step.",

  // COLLECTIONS
  factionIds: ["faction-sunblades", "faction-order-of-light"],
  inventoryIds: ["inv-sword", "inv-shield", "inv-potion"],
  equipmentId: "equip-set-001",
  isDeleted: false,
};
