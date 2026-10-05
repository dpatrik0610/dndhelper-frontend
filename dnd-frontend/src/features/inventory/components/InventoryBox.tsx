import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import type { EquipmentUserResponse } from "@appTypes/Equipment/Equipment";
import { useState } from "react";
import { RemoveItemModal } from "@appTypes/Inventory/components/RemoveItemModal";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import { SectionColor } from "@appTypes/SectionColor";
import { useInventoryStore } from "@store/inventory/inventoryStore";

import { decrementItemQuantity as apiDecreaseQuantity, moveItem, moveItemToCharacter } from "@services/inventoryService";
import { showNotification } from "@components/Notification/Notification";
import { IconCheck } from "@tabler/icons-react";
import { loadInventories } from "@utils/loadinventory";
import { MoveItemModal } from "./MoveItemModal";
import { InventorySection } from "./InventorySection";
import { InventoryItemCard } from "./InventoryItemCard";
import { InventoryCurrencyClaim } from "./InventoryCurrencyClaim";
import { EquipmentModal } from "./EquipmentModal";
import { useFilteredItems } from "@features/inventory/hooks/useFilteredItems";
import type { InventorySort, InventoryViewMode } from "@features/inventory/hooks/useInventoryFilters";
import { useCurrentCharacter } from "@store/character/characterSelectors";

interface InventoryBoxProps {
  inventory: Inventory;
  /** The character's inventories, as move targets. */
  inventories: Inventory[];
  details: Map<string, EquipmentUserResponse>;
  searchTerm: string;
  sortBy: InventorySort;
  viewMode: InventoryViewMode;
}

export default function InventoryBox({ inventory, inventories, details, searchTerm, sortBy, viewMode }: InventoryBoxProps) {
  const character = useCurrentCharacter();
  const decrementItemQuantity = useInventoryStore((state) => state.decrementItemQuantity);

  const [removeTarget, setRemoveTarget] = useState<InventoryItem | null>(null);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const inventoryId = inventory.id!;
  const items = inventory.items ?? [];
  const { filteredItems, hasFilters } = useFilteredItems(inventory.items, searchTerm, sortBy, details);
  const totalWeight = items.reduce((sum, item) => sum + (details.get(item.equipmentId ?? "")?.weight ?? 0) * (item.quantity ?? 1), 0);

  const handleConfirmRemove = async (amount: number) => {
    const equipmentId = removeTarget?.equipmentId;
    if (!equipmentId) return;
    const name = removeTarget.equipmentName || "item";
    setRemoveTarget(null);

    // Optimistic; a failure reloads the real state.
    decrementItemQuantity(inventoryId, equipmentId, amount);
    try {
      await apiDecreaseQuantity(inventoryId, { equipmentId, amount });
      showNotification({
        id: equipmentId,
        title: `Removed ${amount}× ${name}`,
        color: SectionColor.Green,
        icon: <IconCheck />,
        message: "",
      });
    } catch (error) {
      await loadInventories();
      showNotification({
        id: equipmentId,
        title: `Failed to remove ${name}`,
        color: SectionColor.Red,
        message: (error as Error).message,
      });
    }
  };

  const handleConfirmMove = async (payload: { targetInventoryId?: string; targetCharacterId?: string; amount: number }) => {
    if (!moveItemId) return;
    const name = items.find((i) => i.equipmentId === moveItemId)?.equipmentName || "Item";
    const target = payload.targetCharacterId ? "character" : "inventory";

    try {
      if (payload.targetCharacterId) {
        await moveItemToCharacter(inventoryId, moveItemId, payload.targetCharacterId, { amount: payload.amount });
      } else if (payload.targetInventoryId) {
        await moveItem(inventoryId, moveItemId, { targetInventoryId: payload.targetInventoryId, amount: payload.amount });
      }
      showNotification({
        id: moveItemId,
        title: `Moved ${payload.amount}× ${name}`,
        color: SectionColor.Green,
        icon: <IconCheck />,
        message: `Sent to the selected ${target}.`,
      });
    } catch (error) {
      showNotification({
        id: moveItemId,
        title: `Failed to move ${name}`,
        color: SectionColor.Red,
        message: (error as Error).message,
      });
    } finally {
      setMoveItemId(null);
    }
  };

  const cards = filteredItems.map((item) => (
    <InventoryItemCard
      key={item.equipmentId}
      item={item}
      details={details.get(item.equipmentId ?? "")}
      layout={viewMode === "list" ? "row" : "card"}
      onOpen={setDetailId}
      onRemove={setRemoveTarget}
      onMove={setMoveItemId}
    />
  ));

  return (
    <>
      <RemoveItemModal
        opened={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleConfirmRemove}
        itemName={removeTarget?.equipmentName}
        maxAmount={removeTarget?.quantity ?? 1}
      />

      <MoveItemModal
        opened={!!moveItemId}
        onClose={() => setMoveItemId(null)}
        inventories={inventories}
        currentInventoryId={inventoryId}
        currentCharacterId={character?.id}
        itemId={moveItemId}
        onConfirm={handleConfirmMove}
      />

      <EquipmentModal opened={!!detailId} onClose={() => setDetailId(null)} equipmentId={detailId} />

      <InventorySection
        title={inventory.name || "Unnamed Inventory"}
        itemCount={items.length}
        totalWeight={totalWeight}
        currencies={inventory.currencies ?? []}
        matchCount={filteredItems.length}
        hasFilters={hasFilters}
      >
        <Stack gap="sm">
          {!filteredItems.length ? (
            <Text c="dimmed" size="sm" ta="center">
              {items.length ? "No items match your search." : "No items in this inventory."}
            </Text>
          ) : viewMode === "list" ? (
            <Stack gap="xs">{cards}</Stack>
          ) : (
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={{ base: "xs", sm: "sm" }}>
              {cards}
            </SimpleGrid>
          )}

          <InventoryCurrencyClaim inventoryId={inventoryId} />
        </Stack>
      </InventorySection>
    </>
  );
}
