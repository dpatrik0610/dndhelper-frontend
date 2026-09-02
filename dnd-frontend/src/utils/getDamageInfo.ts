import type { Spell } from "@appTypes/Spell";

export const getDamageInfo = (damage: Spell['damage']): { label: string; hasValue: boolean } | null => {
  if (!damage?.damageType?.name) {
    return null;
  }
  
  const damageType = damage.damageType.name;
  let damageValue: string | undefined;
  
  if (damage.damageAtSlotLevel && Object.keys(damage.damageAtSlotLevel).length > 0) {
    damageValue = Object.values(damage.damageAtSlotLevel)[0];
  } else if (damage.damageAtCharacterLevel && Object.keys(damage.damageAtCharacterLevel).length > 0) {
    damageValue = Object.values(damage.damageAtCharacterLevel)[0];
  }
  
  const label = damageValue ? `${damageType} (${damageValue})` : damageType;
  const hasValue = !!damageValue;
  
  return { label, hasValue };
};
