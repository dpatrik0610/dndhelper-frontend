import { Stack, Text, Box } from "@mantine/core";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import { InventoryItemCard } from "./InventoryItemCard";
import { InventoryCurrencyClaim } from "./InventoryCurrencyClaim";
import { Virtuoso } from "react-virtuoso";

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
        <Box style={{ height: "400px" }}>
          <Virtuoso
            style={{ height: "100%", width: "100%" }}
            data={filteredItems}
            itemContent={(_, item) => (
              <Box pb="xs">
                <InventoryItemCard
                  item={item}
                  onRemove={onRemove}
                  onMove={onMove}
                />
              </Box>
            )}
            components={{
              Footer: () => <Box pb="xs" />,
            }}
          />
        </Box>
      ) : (
        <Text c="dimmed" size="sm" ta="center">
          {totalItemsCount ? "No items match your search." : "No items in this inventory."}
        </Text>
      )}

      <InventoryCurrencyClaim inventoryId={inventoryId} />
    </Stack>
  );
}

