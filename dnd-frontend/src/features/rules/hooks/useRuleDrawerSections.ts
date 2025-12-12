import { useMemo } from "react";
import { RuleCategory, type RuleDetail } from "@appTypes/Rules/Rule";

export interface DrawerSection {
  title: string;
  color: string;
  bullets: string[];
}

export function useRuleDrawerSections(selectedDetail: RuleDetail | null) {
  return useMemo<DrawerSection[]>(() => {
    if (!selectedDetail) return [];
    if (selectedDetail.category === RuleCategory.Combat) {
      return [
        {
          title: "Combat flow",
          color: "red",
          bullets: [
            "Start of turn: resolve ongoing effects (e.g., damage over time, saves).",
            "Movement: split around actions; difficult terrain doubles cost.",
            "Action: attack, cast a spell, dash, disengage, dodge, help, hide, ready, search, or interact.",
            "Bonus action: only if a feature/spell grants one; you get at most one.",
            "Reaction: off-turn responses; refreshes at the start of your turn.",
          ],
        },
        {
          title: "Position & cover",
          color: "orange",
          bullets: [
            "Half cover: +2 to AC and Dexterity saves; three-quarters: +5; total cover blocks targeting.",
            "Reach weapons threaten further; opportunity attacks trigger on leaving reach.",
            "Prone: melee attacks from 5 ft have advantage; ranged attacks have disadvantage.",
          ],
        },
      ];
    }
    if (selectedDetail.category === RuleCategory.Magic) {
      return [
        {
          title: "Spellcasting essentials",
          color: "grape",
          bullets: [
            "Components: verbal (audible), somatic (free hand), material/focus (costly materials consumed).",
            "Concentration: one at a time; Con save on damage (DC 10 or half damage). Incapacitated ends it.",
            "Rituals: +10 minutes, no slot if the spell has the ritual tag.",
            "Targeting: respect line of sight/effect; cover can boost AC vs. attack rolls.",
          ],
        },
        {
          title: "Areas & saves",
          color: "violet",
          bullets: [
            "Areas: cones emanate from you; lines stretch from an edge; spheres/cylinders have radii.",
            "Save DC: 8 + proficiency + casting mod; attack rolls use your spell attack bonus.",
            "Damage on save: many spells halve on a successful save (per spell text).",
          ],
        },
      ];
    }
    if (selectedDetail.category === RuleCategory.Status) {
      return [
        {
          title: "Damage & healing",
          color: "teal",
          bullets: [
            "Apply resistances/vulnerabilities after total damage is rolled.",
            "Temporary HP absorbs damage first and doesn't stack—keep the highest pool.",
            "At 0 HP: start death saves (3 successes stabilize; 3 failures = death). Nat 20: to 1 HP. Nat 1: two failures.",
            "Healing from 0 removes the dying state; excess doesn't convert to temp HP.",
          ],
        },
        {
          title: "Common conditions",
          color: "cyan",
          bullets: [
            "Grappled: speed 0; ends if the grappler is incapacitated or you're moved out of reach.",
            "Restrained: speed 0, attacks against you have advantage, your attacks have disadvantage, Dex saves at disadvantage.",
            "Invisible: unseen without magic; attacks against you have disadvantage, your attacks have advantage.",
          ],
        },
      ];
    }
    return [];
  }, [selectedDetail]);
}
