import { IconAdjustments, IconAlertTriangle, IconFlask, IconShirt, IconSparkles, IconStars, type Icon } from "@tabler/icons-react";
import type { AppliedEffect } from "@utils/effects";

/** Label, icon and Mantine color per effect source; the profile and the tabletop show effects the same way. */
export const EFFECT_SOURCES: Record<AppliedEffect["source"], { label: string; Icon: Icon; color: string }> = {
  item: { label: "Item", Icon: IconShirt, color: "teal" },
  potion: { label: "Potion", Icon: IconFlask, color: "grape" },
  spell: { label: "Spell", Icon: IconSparkles, color: "violet" },
  feature: { label: "Feature", Icon: IconStars, color: "yellow" },
  custom: { label: "Other", Icon: IconAdjustments, color: "gray" },
  condition: { label: "Condition", Icon: IconAlertTriangle, color: "red" },
};
