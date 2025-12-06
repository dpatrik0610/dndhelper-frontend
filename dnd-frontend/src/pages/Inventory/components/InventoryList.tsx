import type { Inventory } from "../../../types/Inventory/Inventory";
import { Stack, Title } from "@mantine/core";
import InventoryBox from "./InventoryBox";

interface InventoryListProps {
  inventories: Inventory[];
  searchTerm: string;
}

export function InventoryList({ inventories, searchTerm }: InventoryListProps) {
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
        />
      ))}
    </Stack>
  );
}
