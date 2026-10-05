import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { EquipmentUserResponse } from "@appTypes/Equipment/Equipment";
import type { InventorySort, InventoryViewMode } from "@features/inventory/hooks/useInventoryFilters";
import { Stack, Title } from "@mantine/core";
import InventoryBox from "./InventoryBox";

interface InventoryListProps {
  inventories: Inventory[];
  details: Map<string, EquipmentUserResponse>;
  searchTerm: string;
  sortBy: InventorySort;
  viewMode: InventoryViewMode;
}

export function InventoryList({ inventories, details, searchTerm, sortBy, viewMode }: InventoryListProps) {
  if (!inventories.length)
    return (
      <Title order={4} c="dimmed" ta="center" mt="xl">
        This character has no inventories yet.
      </Title>
    );

  return (
    <Stack gap="sm">
      {inventories.map((inv) => (
        <InventoryBox
          key={inv.id}
          inventory={inv}
          inventories={inventories}
          details={details}
          searchTerm={searchTerm}
          sortBy={sortBy}
          viewMode={viewMode}
        />
      ))}
    </Stack>
  );
}
