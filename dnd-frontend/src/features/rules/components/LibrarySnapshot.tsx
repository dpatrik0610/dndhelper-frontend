import { Badge, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { type RuleCategoryResponse } from "@appTypes/Rules/Rule";
import { useRulesPalette } from "@features/rules/hooks/useRulesPalette";

interface LibrarySnapshotProps {
  summaryStats: { total: number; byCategory: Record<string, number>; topTags: [string, number][] };
  categories: RuleCategoryResponse[];
}

export function LibrarySnapshot({ summaryStats, categories }: LibrarySnapshotProps) {
  const { palette, cardStyle } = useRulesPalette();
  const categoryEntries =
    categories.length > 0
      ? categories.map((c, idx) => ({ name: c.name, order: c.order ?? idx }))
      : Object.keys(summaryStats.byCategory)
          .sort((a, b) => a.localeCompare(b))
          .map((name, idx) => ({ name, order: idx }));

  return (
    <Paper withBorder radius="md" p="lg" shadow="sm" style={cardStyle}>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Stack gap={4}>
          <Text fw={700} size="sm">
            Library snapshot
          </Text>
          <Group gap={6} wrap="wrap">
            {categoryEntries.map((cat) => {
              const key = cat.name || `cat-${cat.order}`;
              const count = summaryStats.byCategory[cat.name] ?? 0;
              return (
                <Badge key={key} size="sm" variant="light" color="grape">
                  {cat.name}: {count}
                </Badge>
              );
            })}
          </Group>
        </Stack>

        <Stack gap={4}>
          <Text fw={700} size="sm">
            Popular tags
          </Text>
          <Group gap={6} wrap="wrap">
            {summaryStats.topTags.map(([tag, count]) => (
              <Badge key={tag} size="sm" variant="outline" color="violet">
                {tag} ({count})
              </Badge>
            ))}
          </Group>
        </Stack>

        <Stack gap={4}>
          <Text fw={700} size="sm">
            How to filter
          </Text>
          <Text size="sm" c={palette.textDim}>
            Pick a topic, then refine with search. Results stay put while the drawer shows details.
          </Text>
        </Stack>
      </SimpleGrid>
    </Paper>
  );
}
