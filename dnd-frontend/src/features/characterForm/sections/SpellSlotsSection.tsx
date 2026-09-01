import { Stack, Group, Text, Box, SimpleGrid } from "@mantine/core";
import { IconWand } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { FormNumberInput } from "@components/common/FormNumberInput";

export function SpellSlotsSection({ noBox = false }: { noBox?: boolean }) {
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

  const content = (
    <Stack gap="md">
      <Group justify="space-between" align="center" px="xs">
        <Text
          className="narrative-title"
          style={{ fontSize: "11px", letterSpacing: "1.5px", color: "var(--theme-color-text-secondary)" }}
        >
          Spell Level
        </Text>
        <Text
          className="narrative-title"
          style={{ fontSize: "11px", letterSpacing: "1.5px", color: "var(--theme-color-text-secondary)" }}
        >
          Current / Max Slots
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {slots.map((slot) => (
          <Group
            key={slot.level}
            justify="space-between"
            align="center"
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
            }}
          >
            {/* Spell Level Identifier */}
            <Group gap="xs">
              <IconWand size={14} style={{ opacity: 0.35, color: "var(--theme-color-accent-secondary)" }} />
              <Text
                className="narrative-title"
                style={{
                  fontSize: "11px",
                  letterSpacing: "2px",
                  color: "var(--theme-color-text-primary, #fff)",
                }}
              >
                Level {slot.level}
              </Text>
            </Group>

            {/* Current / Max Input Group */}
            <Group gap="xs" align="center">
              <FormNumberInput
                hideControls
                min={0}
                max={slot.max}
                value={slot.current}
                classNames={{ input: "glassy-input" }}
                style={{ width: 55 }}
                onChange={(v) => handleChange(slot.level, "current", v ?? 0)}
                styles={{ input: { textAlign: "center", padding: 0 } }}
                aria-label={`Level ${slot.level} Current Slots`}
              />
              <Text size="sm" style={{ opacity: 0.35, fontWeight: 300 }}>/</Text>
              <FormNumberInput
                hideControls
                min={0}
                value={slot.max}
                classNames={{ input: "glassy-input" }}
                style={{ width: 55 }}
                onChange={(v) => handleChange(slot.level, "max", v ?? 0)}
                styles={{ input: { textAlign: "center", padding: 0 } }}
                aria-label={`Level ${slot.level} Max Slots`}
              />
            </Group>
          </Group>
        ))}
      </SimpleGrid>
    </Stack>
  );

  if (noBox) return content;

  return (
    <ExpandableSection
      title="Spell Slots"
      icon={<IconWand />}
      color={SectionColor.Teal}
      defaultOpen
    >
      {content}
    </ExpandableSection>
  );
}