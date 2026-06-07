import { Group, NumberInput, Stack, Switch, TextInput, Text, UnstyledButton, SimpleGrid } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { EQUIPMENT_TIERS } from "@appTypes/Equipment/Equipment";
import { equipmentTierTheme, type EquipmentTier } from "@features/inventory/components/styles/equipmentTheme";
import classes from "./EquipmentForm.module.css";
import "@styles/glassyInput.css";

interface Props {
  draft: Equipment;
  handleChange: <K extends keyof Equipment>(key: K, value: Equipment[K]) => void;
}

const CURRENCIES = [
  { value: "cp", label: "CP", color: "#d97742" },
  { value: "sp", label: "SP", color: "#c0c0c0" },
  { value: "ep", label: "EP", color: "#759cb3" },
  { value: "gp", label: "GP", color: "#ffd700" },
  { value: "pp", label: "PP", color: "#e5e4e2" },
];

export function EquipmentBasicInfo({ draft, handleChange }: Props) {
  const glass = { input: "glassy-input", label: "glassy-label" };

  return (
    <div className={classes.glassyCard}>
      <div className={classes.sectionTitle}>
        <IconInfoCircle size={16} className={classes.sectionIcon} />
        Basic Information
      </div>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            classNames={glass}
            label="Name"
            placeholder="e.g. Longsword"
            value={draft.name}
            onChange={(e) => handleChange("name", e.currentTarget.value)}
            required
          />
          <TextInput
            classNames={glass}
            label="Index"
            placeholder="e.g. longsword"
            value={draft.index}
            onChange={(e) => handleChange("index", e.currentTarget.value)}
            required
          />
        </SimpleGrid>

        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text className="glassy-label" size="sm" fw={500}>Tier</Text>
            <Group gap={6} wrap="wrap">
              {EQUIPMENT_TIERS.map((t) => {
                const isActive = draft.tier === t;
                const theme = equipmentTierTheme[t as EquipmentTier] || equipmentTierTheme.default;
                return (
                  <UnstyledButton
                    key={t}
                    onClick={() => handleChange("tier", isActive ? undefined : t)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${isActive ? `var(--mantine-color-${theme.badgeColor}-5)` : 'rgba(255,255,255,0.15)'}`,
                      background: isActive ? theme.gradient : 'rgba(0,0,0,0.2)',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      transition: "all 0.2s ease",
                      boxShadow: isActive ? `0 0 12px ${theme.glow}` : 'none',
                      textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                    }}
                  >
                    {t}
                  </UnstyledButton>
                );
              })}
            </Group>
          </Stack>
          
          <Stack gap={4} align="flex-end">
            <Text className="glassy-label" size="sm" fw={500}>Custom Item</Text>
            <Switch
              className="sq-switch"
              classNames={{ track: "sq-switch-track", thumb: "sq-switch-thumb" }}
              checked={draft.isCustom}
              onChange={(e) => handleChange("isCustom", e.currentTarget.checked)}
              size="md"
              color="teal"
            />
          </Stack>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <NumberInput
            classNames={glass}
            label="Cost Quantity"
            min={0}
            value={draft.cost?.quantity ?? 0}
            onChange={(v) => handleChange("cost", { quantity: Number(v ?? 0), unit: draft.cost?.unit ?? "gp" })}
          />
          
          <Stack gap={4}>
            <Text className="glassy-label" size="sm" fw={500}>Unit</Text>
            <Group gap={4} wrap="nowrap" style={{ height: 36, alignItems: "center" }}>
              {CURRENCIES.map((c) => {
                const isActive = (draft.cost?.unit ?? "gp") === c.value;
                return (
                  <UnstyledButton
                    key={c.value}
                    onClick={() => handleChange("cost", { quantity: draft.cost?.quantity ?? 0, unit: c.value })}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "4px 0",
                      borderRadius: "6px",
                      border: `1px solid ${isActive ? c.color : 'rgba(255,255,255,0.1)'}`,
                      background: isActive ? `${c.color}22` : 'rgba(0,0,0,0.2)',
                      color: isActive ? c.color : 'rgba(255,255,255,0.5)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "13px",
                      transition: "all 0.2s ease",
                      boxShadow: isActive ? `0 0 8px ${c.color}44` : 'none',
                    }}
                  >
                    {c.label}
                  </UnstyledButton>
                );
              })}
            </Group>
          </Stack>

          <NumberInput
            classNames={glass}
            label="Weight (lb)"
            min={0}
            step={0.5}
            value={draft.weight ?? 0}
            onChange={(v) => handleChange("weight", Number(v ?? 0))}
          />
        </SimpleGrid>
      </Stack>
    </div>
  );
}
