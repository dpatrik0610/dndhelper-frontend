import { Paper, SimpleGrid, Text, Title } from "@mantine/core";

interface StatsGridProps {
  total: number;
  active: number;
  banned: number;
}

export function StatsGrid({ total, active, banned }: StatsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(40, 0, 0, 0.35)",
          border: "1px solid rgba(255, 80, 80, 0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Text size="sm" c="dimmed">
          Total users
        </Text>
        <Title order={3}>{total}</Title>
      </Paper>

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(20, 40, 20, 0.35)",
          border: "1px solid rgba(80, 200, 120, 0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Text size="sm" c="dimmed">
          Active
        </Text>
        <Title order={3}>{active}</Title>
      </Paper>

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(60, 0, 0, 0.35)",
          border: "1px solid rgba(255, 100, 100, 0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Text size="sm" c="dimmed">
          Banned
        </Text>
        <Title order={3}>{banned}</Title>
      </Paper>
    </SimpleGrid>
  );
}
