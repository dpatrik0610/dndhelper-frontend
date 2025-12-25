import { SectionColor } from "@appTypes/SectionColor";

export type EquipmentTier =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Very Rare"
  | "Legendary"
  | "Artifact";

export const equipmentTierTheme: Record<
    EquipmentTier | "default",
    {
        accent: SectionColor;
        glow: string;
        gradient: string;
        badgeColor: SectionColor;
    }
    > = {
    Common: {
        accent: SectionColor.Dark,
        glow: "rgba(120, 120, 130, 0.15)",
        gradient: "linear-gradient(175deg, #232528 0%, #121417 100%)",
        badgeColor: SectionColor.Dark,
    },
    Uncommon: {
        accent: SectionColor.Green,
        glow: "rgba(0,200,120,0.2)",
        gradient: "linear-gradient(175deg, #0b2a1d 0%, #071610 100%)",
        badgeColor: SectionColor.Green,
    },
    Rare: {
        accent: SectionColor.Blue,
        glow: "rgba(80,120,255,0.25)",
        gradient: "linear-gradient(175deg, #0b1230 0%, #050818 100%)",
        badgeColor: SectionColor.Blue,
    },
    "Very Rare": {
        accent: SectionColor.Violet,
        glow: "rgba(160,70,255,0.3)",
        gradient: "linear-gradient(175deg, #1a0830 0%, #0d0418 100%)",
        badgeColor: SectionColor.Violet,
    },
    Legendary: {
        accent: SectionColor.Orange,
        glow: "rgba(255,140,0,0.35)",
        gradient: "linear-gradient(175deg, #2b1400 0%, #140900 100%)",
        badgeColor: SectionColor.Orange,
    },
    Artifact: {
        accent: SectionColor.Red,
        glow: "rgba(255, 80, 80, 0.45)",
        gradient: "linear-gradient(175deg, #2a0c0c 0%, #120606 100%)",
        badgeColor: SectionColor.Red,
    },
    default: {
        accent: SectionColor.Gray,
        glow: "rgba(255,255,255,0.1)",
        gradient: "linear-gradient(175deg, #1a1a1a 0%, #0e0e0e 100%)",
        badgeColor: SectionColor.Gray,
    },
};