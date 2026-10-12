import type { Monster } from "@appTypes/Monster";
import { signed } from "./effects";

export const abilityMod = (score: number) => Math.floor((score - 10) / 2);

/** 5e proficiency bonus by challenge rating. */
export const proficiencyBonus = (cr: number) => (cr < 5 ? 2 : Math.floor((cr - 1) / 4) + 2);

const XP: Record<string, number> = {
  "0": 10, "0.125": 25, "0.25": 50, "0.5": 100, "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
  "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900, "11": 7200, "12": 8400, "13": 10000,
  "14": 11500, "15": 13000, "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000, "26": 90000, "27": 105000,
  "28": 120000, "29": 135000, "30": 155000,
};

export const crXp = (cr: number) => XP[String(cr)] ?? 0;

/** 0.125 → "1/8", 0.25 → "1/4", 0.5 → "1/2". */
export const crLabel = (cr: number) => ({ 0.125: "1/8", 0.25: "1/4", 0.5: "1/2" })[cr] ?? String(cr);

export const CR_VALUES = [0, 0.125, 0.25, 0.5, ...Array.from({ length: 30 }, (_, i) => i + 1)];

/** "30 ft., fly 60 ft. (hover), swim 30 ft." */
export function speedText(speed: Monster["speed"]) {
  const parts = [`${speed.walk ?? 0} ft.`];
  for (const key of ["burrow", "climb", "fly", "swim"] as const) {
    const ft = speed[key];
    if (ft) parts.push(`${key} ${ft} ft.${key === "fly" && speed.hover ? " (hover)" : ""}`);
  }
  return parts.join(", ");
}

/** "Dex +6, Con +13" in ability order. */
export function bonusList(bonuses: Record<string, number>, order?: readonly string[]) {
  const keys = order ? order.filter((k) => k in bonuses) : Object.keys(bonuses).sort();
  return keys.map((k) => `${k.charAt(0).toUpperCase()}${k.slice(1)} ${signed(bonuses[k])}`).join(", ");
}

export type SrdVersion = "5.1" | "5.2";

/** "SRD 5.1" → "5.1"; null for anything that isn't SRD material (it then needs no Wizards of the Coast credit). */
export const srdVersion = (source?: string | null): SrdVersion | null =>
  source === "SRD 5.1" ? "5.1" : source === "SRD 5.2" ? "5.2" : null;

export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;

/** A blank stat block for "New monster". */
export const emptyMonster = (): Monster => ({
  name: "",
  isNpc: false,
  tags: [],
  armorClass: 10,
  hitPoints: 1,
  speed: { walk: 30 },
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  savingThrows: {},
  skills: {},
  damageVulnerabilities: [],
  damageResistances: [],
  damageImmunities: [],
  conditionImmunities: [],
  senses: [],
  passivePerception: 10,
  languages: [],
  challengeRating: 0,
  traits: [],
  actions: [],
  bonusActions: [],
  reactions: [],
  legendaryActions: [],
});
