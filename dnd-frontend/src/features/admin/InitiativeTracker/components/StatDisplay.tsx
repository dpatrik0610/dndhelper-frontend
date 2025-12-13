import { SectionColor } from "@appTypes/SectionColor";
import { Box, Group, Text } from "@mantine/core";

interface StatDisplayProps {
  value: number | null | undefined;
  label: string;
}

export function StatDisplay({ value, label }: StatDisplayProps) {
  return (
    <Box
      px={8}
      py={6}
      style={{
        borderRadius: 8,
        border: "1px solid rgba(180,150,255,0.35)",
        background: "rgba(120,80,200,0.08)",
      }}
    >
      <Group gap={6} align="center" wrap="nowrap">
        <Text size="sm" c={SectionColor.Orange} style={{ lineHeight: 1 }}>
          {label}:
        </Text>
        <Text size="sm" fw={600} style={{ lineHeight: 1 }}>
          {value ?? 0}
        </Text>
      </Group>
    </Box>
  );
}
