import type { Equipment } from "../../../types/Equipment/Equipment";

export const defaultEquipment: Equipment = {
  index: "",
  name: "",
  description: [],
  dmDescription: [],
  cost: { quantity: 0, unit: "gp" },
  damage: undefined,
  range: undefined,
  weight: 0,
  isCustom: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDeleted: false,
  tags: [],
  tier: undefined,
};
