import { Group, Loader, Paper, Title, Text } from "@mantine/core";
import { useAdminInventoryStore } from "../../../../../store/admin/useAdminInventoryStore";
import { ItemCardGrid } from "./ItemCardGrid";

export function InventoryItemsPanel() {
  const { selected, loading } = useAdminInventoryStore();

  if (!selected)
    return (
      <Paper
        mt="md"
        p="xl"
        radius="md"
        withBorder
        style={{
          textAlign: "center",
          background: "linear-gradient(145deg, rgba(30,0,50,0.5), rgba(10,0,20,0.4))",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Title order={4} c="grape.3" mb="xs">
          No inventory selected
        </Title>
        <Text size="sm" c="dimmed">
          Choose an inventory from the list above to view or manage its items.
        </Text>
      </Paper>
    );

  if (loading)
    return (
      <Group justify="center" mt="xl">
        <Loader color="grape" size="lg" />
      </Group>
    );

  const EmptyState = () => (
    <Paper
      withBorder
      radius="md"
      p="lg"
      style={{
        textAlign: "center",
        background: "rgba(40,0,70,0.4)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Title order={5} c="grape.2" mb={6}>
        No items in this inventory
      </Title>
    </Paper>
  );

  return (
    <>
    {selected.items?.length ? <ItemCardGrid /> : <EmptyState />}
    </>
  );
}
