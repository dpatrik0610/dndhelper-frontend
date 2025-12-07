import type { Equipment } from "@appTypes/Equipment/Equipment";

export const equipmentTemplate: Equipment = {
  index: "sword-001",
  name: "Sword of Dawn",
  description: ["A finely crafted blade."],
  dmDescription: ["Hidden history or DM-only notes."],
  cost: { quantity: 50, unit: "gp" },
  damage: { damageDice: "1d8", damageType: { name: "Slashing" } },
  range: { normal: 5, long: 0 },
  weight: 3,
  isCustom: true,
  isDeleted: false,
  tags: ["melee", "light"],
  tier: "Common",
};

export const importSampleArray: Equipment[] = [
  equipmentTemplate,
  { ...equipmentTemplate, name: "Shield", index: "shield-001", damage: undefined, tags: ["shield"] },
];

export const importSamplePretty = JSON.stringify(importSampleArray, null, 2);
