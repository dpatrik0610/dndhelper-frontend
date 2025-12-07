import { RuleCategory } from "@appTypes/Rules/Rule";
import { IconShieldHalf, IconSword, IconWand } from "@tabler/icons-react";

export const ruleTopics = [
  { label: "All", value: "all" },
  { label: "Core rules", value: RuleCategory.Core },
  { label: "Combat", value: RuleCategory.Combat },
  { label: "Magic", value: RuleCategory.Magic },
  { label: "Conditions", value: RuleCategory.Status },
  { label: "Exploration", value: RuleCategory.Exploration },
  { label: "Equipment", value: RuleCategory.Equipment },
  { label: "Downtime", value: RuleCategory.Downtime },
  { label: "Homebrew", value: "homebrew" },
  { label: "Stealth", value: "stealth" },
  { label: "Resting", value: "resting" },
];

export const featuredRules = [
  {
    icon: IconSword,
    color: "red",
    title: "Combat flow",
    body: "Turn order, actions, reactions, bonus actions, and movement rules.",
    category: RuleCategory.Combat,
    bullets: [
      "Start: resolve ongoing effects.",
      "Movement: split around actions; terrain slows.",
      "Action: attack, cast, dash, disengage, dodge, help, hide, ready, search, interact.",
      "Bonus action: only if granted.",
      "Reaction: off-turn, refreshes on your turn.",
    ],
  },
  {
    icon: IconWand,
    color: "grape",
    title: "Spellcasting",
    body: "Components, concentration, ritual casting, and spell save DC math.",
    category: RuleCategory.Magic,
    bullets: [
      "Components: verbal, somatic (free hand), material/focus.",
      "Concentration: one at a time; Con save on damage (DC 10 or half).",
      "Targeting: line of sight/effect; cover boosts AC vs attacks.",
      "Rituals: +10 minutes, no slot if the spell has the ritual tag.",
    ],
  },
  {
    icon: IconShieldHalf,
    color: "teal",
    title: "Damage & healing",
    body: "Resistance, vulnerability, temporary HP, and death saves.",
    category: RuleCategory.Status,
    bullets: [
      "Apply resistance/vulnerability after total damage.",
      "Temp HP absorbs first; doesn't stack—keep the highest pool.",
      "Death saves: 3 successes stabilize; 3 fails = death; nat 20 → 1 HP; nat 1 = two fails.",
      "Healing from 0 removes dying; excess doesn't become temp HP.",
    ],
  },
];
