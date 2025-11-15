import { Stack, Group, Text, Box } from "@mantine/core";
import { IconWand } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import { FormNumberInput } from "../../../components/common/FormNumberInput";
import "../../../styles/glassyInput.css";

export function SpellSlotsSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const slots = characterForm.spellSlots ?? [];

  const handleChange = (
    level: number,
    field: "current" | "max",
    value: number
  ) => {
    const num = Number(value) || 0;

    setCharacterForm({
      spellSlots: slots.map((s) => {
        if (s.level !== level) return s;

        // Apply clamping differently based on which field was edited
        if (field === "current") {
          return {
            ...s,
            current: Math.min(Math.max(num, 0), s.max),
          };
        }

        // Editing max:
        const newMax = Math.max(num, 0);
        return {
          ...s,
          max: newMax,
          current: Math.min(s.current, newMax),
        };
      }),
    });
  };

  return (
    <ExpandableSection
      title="Spell Slots"
      icon={<IconWand />}
      color={SectionColor.Teal}
      defaultOpen
    >
      <Stack gap="xs">
      {slots.map((slot) => (
      <Stack
        key={slot.level}
        gap={6}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* Highlighted level ribbon */}
        <Box
          style={{
            padding: "2px 0px",
            textAlign: "center",
            color: "#eaffff",
            fontWeight: 700,
            letterSpacing: 0.5,
            fontSize: 16,
          }}
        >
          Level {slot.level}
        </Box>

        {/* CURRENT */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="gray.3">Current</Text>
          <FormNumberInput
            hideControls
            min={0}
            max={slot.max}
            value={slot.current}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
            style={{ width: 70 }}
            onChange={(v) => handleChange(slot.level, "current", v ?? 0)}
          />
        </Group>

        {/* MAX */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="gray.3">Max</Text>
          <FormNumberInput
            hideControls
            min={0}
            value={slot.max}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
            style={{ width: 70 }}
            onChange={(v) => handleChange(slot.level, "max", v ?? 0)}
          />
        </Group>
      </Stack>
      ))}
      </Stack>
    </ExpandableSection>
  );
}
