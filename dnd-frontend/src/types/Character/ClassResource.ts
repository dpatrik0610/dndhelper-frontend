export type ResourceRecharge = "short" | "long" | "none";

export interface ClassResource {
  name: string;
  current: number;
  max: number;
  recharge: ResourceRecharge;
}

/** 5e class pools offered as suggestions; any other name is allowed as a custom resource. */
export const CLASS_RESOURCE_PRESETS: { name: string; recharge: ResourceRecharge }[] = [
  { name: "Ki Points", recharge: "short" },
  { name: "Sorcery Points", recharge: "long" },
  { name: "Rage", recharge: "long" },
  { name: "Bardic Inspiration", recharge: "long" },
  { name: "Channel Divinity", recharge: "short" },
  { name: "Wild Shape", recharge: "short" },
  { name: "Lay on Hands (HP)", recharge: "long" },
  { name: "Divine Sense", recharge: "long" },
  { name: "Superiority Dice", recharge: "short" },
  { name: "Action Surge", recharge: "short" },
  { name: "Second Wind", recharge: "short" },
  { name: "Indomitable", recharge: "long" },
  { name: "Pact Magic Slots", recharge: "short" },
  { name: "Mystic Arcanum", recharge: "long" },
  { name: "Arcane Recovery", recharge: "long" },
  { name: "Psionic Energy Dice", recharge: "long" },
  { name: "Favored Foe", recharge: "long" },
  { name: "Infusions", recharge: "long" },
  { name: "Flash of Genius", recharge: "long" },
  { name: "Hit Dice", recharge: "long" },
];
