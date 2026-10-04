import { Group, SimpleGrid, Skeleton, Stack, type SimpleGridProps } from "@mantine/core";

/** Placeholder shapes for loading states. Shimmer + theme colours come from styles/loaders.css. */

/** Text-like lines; the last one is shorter, like a paragraph end. */
export function LinesSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Stack gap={8}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} h={12} radius="sm" w={i === lines - 1 ? "60%" : "100%"} />
      ))}
    </Stack>
  );
}

/** Stacked rows (list items, table rows, roll history entries). */
export function ListSkeleton({ rows = 5, height = 56 }: { rows?: number; height?: number }) {
  return (
    <Stack gap="xs">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} h={height} radius="md" />
      ))}
    </Stack>
  );
}

/** Grid of cards (quests, shop shelves, settings tiles). */
export function CardGridSkeleton({
  count = 4,
  cols = { base: 1, md: 2 },
  height = 160,
}: {
  count?: number;
  cols?: SimpleGridProps["cols"];
  height?: number;
}) {
  return (
    <SimpleGrid cols={cols} spacing="md">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} h={height} radius="md" />
      ))}
    </SimpleGrid>
  );
}

/** Generic page: header (icon + title + subtitle), a row of cards, then a list. Route-level fallback. */
export function PageSkeleton() {
  return (
    <Stack gap="lg" maw={1200} mx="auto" w="100%" p="md" aria-busy="true" aria-label="Loading">
      <Group gap="sm" wrap="nowrap">
        <Skeleton h={40} w={40} circle />
        <Stack gap={6} style={{ flex: 1 }}>
          <Skeleton h={18} w="30%" radius="sm" />
          <Skeleton h={11} w="18%" radius="sm" />
        </Stack>
      </Group>
      <CardGridSkeleton count={3} cols={{ base: 1, sm: 3 }} height={120} />
      <ListSkeleton rows={4} />
    </Stack>
  );
}
