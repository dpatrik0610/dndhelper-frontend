import type { Inventory } from "@appTypes/Inventory/Inventory";
import { Stack, Title } from "@mantine/core";
import InventoryBox from "./InventoryBox";

interface InventoryListProps {
  inventories: Inventory[];
  searchTerm: string;
  viewMode: "list" | "cards";
}

export function InventoryList({ inventories, searchTerm, viewMode }: InventoryListProps) {
  if (!inventories.length)
    return (
      <Title order={4} c="dimmed" ta="center" mt="xl">
        No inventories found
      </Title>
    );

  return (
    <Stack gap={0}>
      {inventories.map((inv) => (
        <InventoryBox
          key={inv.id}
          inventory={inv}
          searchTerm={searchTerm}
          viewMode={viewMode}
        />
      ))}
    </Stack>
  );
}

