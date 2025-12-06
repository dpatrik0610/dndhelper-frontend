import { Stack, Text } from "@mantine/core";
import type { InventoryItem } from "../../../types/Inventory/InventoryItem";
import { InventoryItemCard } from "./InventoryItemCard";
import { InventoryCurrencyClaim } from "./InventoryCurrencyClaim";

interface InventoryItemsListProps {
  filteredItems: InventoryItem[];
  totalItemsCount: number;
  inventoryId: string;
  onRemove: (equipmentId: string) => void;
  onMove: (equipmentId: string) => void;
}

export function InventoryItemsList({
  filteredItems,
  totalItemsCount,
  inventoryId,
  onRemove,
  onMove,
}: InventoryItemsListProps) {
  return (
    <Stack gap="xs" mt="xs">
      {filteredItems.length ? (
        filteredItems.map((item) => (
          <InventoryItemCard
            key={item.equipmentId}
            item={item}
            onRemove={onRemove}
            onMove={onMove}
          />
        ))
      ) : (
        <Text c="dimmed" size="sm" ta="center">
          {totalItemsCount ? "No items match your search." : "No items in this inventory."}
        </Text>
      )}

      <InventoryCurrencyClaim inventoryId={inventoryId} />
    </Stack>
  );
}
