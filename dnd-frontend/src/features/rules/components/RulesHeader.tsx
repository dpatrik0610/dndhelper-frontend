import { Group, Text, Title } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import CustomBadge from "@components/common/CustomBadge";
import { magicGlowTheme } from "@styles/magic/glowTheme";
import { useRulesPalette } from "../hooks/useRulesPalette";

export function RulesHeader() {
  const { palette } = useRulesPalette();
  return (
    <Group justify="space-between" align="flex-start">
      <div>
        <Title order={2}>D&D Rules Reference</Title>
        <Text c={palette.textDim} size="sm">
          Quick rulings and rules text, powered by the API.
        </Text>
      </div>
      <Group gap="xs">
        <CustomBadge
          label="Demo"
          color="grape"
          variant="filled"
          icon={<IconSparkles size={14} />}
          hoverText="Design preview - data is mock, wiring later"
          style={{
            boxShadow: magicGlowTheme.badge.boxShadow,
            background: magicGlowTheme.badge.background,
            border: magicGlowTheme.badge.border,
          }}
        />
      </Group>
    </Group>
  );
}
