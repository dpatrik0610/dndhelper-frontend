import { Stack, Group, NumberInput, Text, Tooltip } from "@mantine/core";
import { IconWand } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";

export function SpellSlotsSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const slots = characterForm.spellSlots ?? [];

  const handleChange = (level: number, field: "current" | "max", value: number | string) => {
    const num = typeof value === "number" ? value : Number(value) || 0;

    setCharacterForm({
      spellSlots: slots.map((s) => {
        if (s.level !== level) return s;

        // Clamp current to never exceed max
        const newValue =
          field === "current"
            ? Math.min(Math.max(num, 0), s.max)
            : Math.max(num, 0);

        // If max is reduced below current, clamp current too
        if (field === "max" && s.current > newValue)
          return { ...s, max: newValue, current: newValue };

        return { ...s, [field]: newValue };
      }),
    });
  };

  return (
    <ExpandableSection title="Spell Slots" icon={<IconWand />} color={SectionColor.Teal} defaultOpen>
      <Stack gap="xs">
        {slots.map((slot) => (
          <Group key={slot.level} grow>
            <Text fw={500} c="gray.2" w={70}>Level {slot.level}</Text>

            <Tooltip label="Current available spell slots" withArrow color="dark">
              <NumberInput
                classNames={{ input: "glassy-input", label: "glassy-label" }}
                label="Current"
                min={0}
                max={slot.max}
                value={slot.current}
                onChange={(v) => handleChange(slot.level, "current", v ?? 0)}
              />
            </Tooltip>

            <Tooltip label="Maximum spell slots for this level" withArrow color="dark">
              <NumberInput
                classNames={{ input: "glassy-input", label: "glassy-label" }}
                label="Max"
                min={0}
                value={slot.max}
                onChange={(v) => handleChange(slot.level, "max", v ?? 0)}
              />
            </Tooltip>
          </Group>
        ))}
      </Stack>
    </ExpandableSection>
  );
}
