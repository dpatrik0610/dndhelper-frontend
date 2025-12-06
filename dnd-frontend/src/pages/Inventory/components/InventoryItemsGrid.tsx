import { SimpleGrid, Text, Box } from "@mantine/core";
import type { InventoryItem } from "../../../types/Inventory/InventoryItem";
import { InventoryItemCard } from "./InventoryItemCard";
import { InventoryCurrencyClaim } from "./InventoryCurrencyClaim";

interface InventoryItemsGridProps {
  filteredItems: InventoryItem[];
  totalItemsCount: number;
  inventoryId: string;
  onRemove: (equipmentId: string) => void;
  onMove: (equipmentId: string) => void;
}

export function InventoryItemsGrid({
  filteredItems,
  totalItemsCount,
  inventoryId,
  onRemove,
  onMove,
}: InventoryItemsGridProps) {
  return (
    <Box>
      {filteredItems.length ? (
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3 }}
          spacing="sm"
          verticalSpacing="sm"
        >
          {filteredItems.map((item) => (
            <InventoryItemCard
              key={item.equipmentId}
              item={item}
              onRemove={onRemove}
              onMove={onMove}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Text c="dimmed" size="sm" ta="center" mt="xs">
          {totalItemsCount ? "No items match your search." : "No items in this inventory."}
        </Text>
      )}

      <InventoryCurrencyClaim inventoryId={inventoryId} />
    </Box>
  );
}
