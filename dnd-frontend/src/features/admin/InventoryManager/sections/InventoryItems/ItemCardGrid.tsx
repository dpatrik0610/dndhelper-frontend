import { SimpleGrid, Text, Paper, Center, Box } from "@mantine/core";
import { IconBox } from "@tabler/icons-react";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";
import { ItemCard } from "./ItemCard";

export function ItemCardGrid() {
  const { selected } = useAdminInventoryStore();
  const items = selected?.items ?? [];

  if (items.length === 0)
    return (
      <Paper
        radius="md"
        p="lg"
        style={{
          background: "rgba(40,0,70,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Center>
          <IconBox size={22} color="var(--mantine-color-grape-4)" />
        </Center>
        <Text ta="center" size="sm" c="dimmed">
          No items in this inventory yet.
        </Text>
      </Paper>
    );

  return (
  <SimpleGrid
    cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
    spacing="sm"
    verticalSpacing="sm"
    style={{
      alignItems: "stretch",
      width: "100%",
    }}
  >
    {items.map((item) => (
      <Box key={item.equipmentId} style={{ height: "100%", display: "flex" }}>
        <ItemCard itemId={item.equipmentId!} />
      </Box>
    ))}
  </SimpleGrid>
  );
}
