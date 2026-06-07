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