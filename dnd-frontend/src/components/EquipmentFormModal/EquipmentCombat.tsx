import { NumberInput, Stack, TextInput, Select, SimpleGrid } from "@mantine/core";
import { IconSwords } from "@tabler/icons-react";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import classes from "./EquipmentForm.module.css";
import "@styles/glassyInput.css";

const DAMAGE_TYPES = [
  "Acid", "Bludgeoning", "Cold", "Fire", "Force", 
  "Lightning", "Necrotic", "Piercing", "Poison", 
  "Psychic", "Radiant", "Slashing", "Thunder"
];

interface Props {
  draft: Equipment;
  handleChange: <K extends keyof Equipment>(key: K, value: Equipment[K]) => void;
}

export function EquipmentCombat({ draft, handleChange }: Props) {
  const glass = { input: "glassy-input", label: "glassy-label" };

  const handleDamageDiceChange = (value: string) => {
    const damageTypeName = draft.damage?.damageType?.name ?? "";
    handleChange("damage", value ? { damageDice: value, damageType: { name: damageTypeName } } : undefined);
  };

  const handleDamageTypeChange = (value: string | null) => {
    const damageDice = draft.damage?.damageDice ?? "";
    if (value || damageDice) {
      handleChange("damage", { damageDice, damageType: { name: value ?? "" } });
    } else {
      handleChange("damage", undefined);
    }
  };

  return (
    <div className={classes.glassyCard}>
      <div className={classes.sectionTitle}>
        <IconSwords size={16} className={classes.sectionIcon} />
        Combat Stats
      </div>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            classNames={glass}
            label="Damage Dice"
            placeholder="e.g. 1d8"
            value={draft.damage?.damageDice ?? ""}
            onChange={(e) => handleDamageDiceChange(e.currentTarget.value)}
          />
          <Select
            classNames={{ ...glass, dropdown: "glassy-dropdown", option: "glassy-option" }}
            label="Damage Type"
            placeholder="Select type"
            data={DAMAGE_TYPES}
            value={draft.damage?.damageType?.name ?? null}
            onChange={handleDamageTypeChange}
            searchable
            clearable
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <NumberInput
            classNames={glass}
            label="Range (Normal)"
            min={0}
            step={5}
            value={draft.range?.normal ?? 0}
            onChange={(v) => handleChange("range", { normal: Number(v ?? 0), long: draft.range?.long ?? 0 })}
          />
          <NumberInput
            classNames={glass}
            label="Range (Long)"
            min={0}
            step={5}
            value={draft.range?.long ?? 0}
            onChange={(v) => handleChange("range", { normal: draft.range?.normal ?? 0, long: Number(v ?? 0) })}
          />
        </SimpleGrid>
      </Stack>
    </div>
  );
}
