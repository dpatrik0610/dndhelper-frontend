import type { Equipment } from '@appTypes/Equipment/Equipment';

export const defaultEquipment: Equipment = {
  id: '',
  index: '',
  name: '',
  description: [],
  weight: 0,
  cost: { quantity: 0, unit: 'gp' },
  tier: 'Common',
  isCustom: true,
  isDeleted: false,
};

/** The equipment's lookup key, derived from its name: "Bag of Holding" -> "bag-of-holding". */
export const equipmentIndex = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
