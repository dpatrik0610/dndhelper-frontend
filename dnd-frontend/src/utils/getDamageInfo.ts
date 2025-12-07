import type { Spell } from "@appTypes/Spell";

  export const getDamageInfo = (damage: Spell['damage']): { label: string; hasValue: boolean } | null => {
    // console.log('getDamageInfo called with:', damage);
    
    if (!damage?.damageType?.name) {
      // console.log('No damage type found, returning null');
      return null;
    }
    
    const damageType = damage.damageType.name;
    // console.log('Damage type:', damageType);
    
    let damageValue: string | undefined;
    
    if (damage.damageAtSlotLevel && Object.keys(damage.damageAtSlotLevel).length > 0) {
      damageValue = Object.values(damage.damageAtSlotLevel)[0];
      // console.log('Found slot level damage:', damageValue, 'from:', damage.damageAtSlotLevel);
    } else if (damage.damageAtCharacterLevel && Object.keys(damage.damageAtCharacterLevel).length > 0) {
      damageValue = Object.values(damage.damageAtCharacterLevel)[0];
      // console.log('Found character level damage:', damageValue, 'from:', damage.damageAtCharacterLevel);
    }
    
    const label = damageValue ? `${damageType} (${damageValue})` : damageType;
    const hasValue = !!damageValue;
    
    // console.log('Final damage label:', label, 'hasValue:', hasValue);
    
    return { label, hasValue };
  };