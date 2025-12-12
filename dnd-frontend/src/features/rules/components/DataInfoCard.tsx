import { Paper, Stack, Text } from "@mantine/core";
import { useRulesPalette } from "../hooks/useRulesPalette";

interface DataInfoCardProps {
  rulesCount: number;
  topicsCount: number;
}

export function DataInfoCard({ rulesCount, topicsCount }: DataInfoCardProps) {
  const { cardStyle, palette } = useRulesPalette();
  return (
    <Paper withBorder radius="md" p="lg" shadow="sm" style={cardStyle}>
      <Stack gap="xs">
        <Text fw={700} size="sm">
          Data source
        </Text>
        <Text size="sm" c={palette.textDim}>
          Rules and categories load from the API. Use the filters above to narrow results; pagination shows 15 at a time.
        </Text>
        <Text size="sm" c={palette.textDim}>
          {rulesCount} rules, {topicsCount} topics currently loaded.
        </Text>
      </Stack>
    </Paper>
  );
}
