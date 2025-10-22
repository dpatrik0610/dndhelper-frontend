import type { Inventory } from "../../../types/Inventory/Inventory";
import { useEffect, useState } from "react";
import { RemoveItemModal } from "../../../types/Inventory/components/RemoveItemModal";
import { Stack, Text, Loader, Center} from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useInventoryStore } from "../../../store/useInventorystore";
import { InventoryItemCard } from "./InventoryItemCard";
import { useAuthStore } from "../../../store/useAuthStore";
import { decrementItemQuantity as apiDecreaseQuantity, moveItem, type ModifyEquipmentAmount, type MoveItemRequest } from "../../../services/inventoryService";
import { showNotification } from "../../../components/Notification/Notification";
import { IconCheck } from "@tabler/icons-react";
import { loadInventories } from "../../../utils/loadinventory";
import { MoveItemModal } from "./MoveItemModal";
import { InventoryCurrencyClaim } from "./InventoryCurrencyClaim";

interface InventoryBoxProps {
  inventory: Inventory;
}

export default function InventoryBox({ inventory }: InventoryBoxProps) {
  const inventories = useInventoryStore((state) => state.inventories);

  const { decrementItemQuantity } = useInventoryStore();
  const token = useAuthStore.getState().token;
  const [removeModalOpened, setRemoveModalOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [moveModalOpened, setMoveModalOpened] = useState(false);
  const [currentInventory, setCurrentInventory] = useState<Inventory | null>();

  // Try loading the inventory if not found
  useEffect(() => {
    const fetchIfMissing = async () => {
      if (!currentInventory && token) {
        setLoading(true);
        await loadInventories(token);
        setLoading(false);
      }
    };
    fetchIfMissing();
  }, [currentInventory, token]);

  // Reload inventory when change happens.
  useEffect(() => {
    if (!inventories) return;

    setCurrentInventory(inventories.find((x) => x.id === inventory.id));
    console.log("Change happened.")
  }, [inventories]);

  // Item removal
  const handleRemoveClick = (equipmentId: string) => {
    setSelectedItem(equipmentId);
    setRemoveModalOpened(true);
  };

  // Item move
  const handleMoveClick = (equipmentId: string) => {
      setMoveItemId(equipmentId);
      setMoveModalOpened(true);
  };

  const handleConfirmRemove = (amount: number) => {
    if (!selectedItem || !currentInventory || !currentInventory.id) return;

    // Update store immediately
    decrementItemQuantity(currentInventory.id, selectedItem, amount);

    // Send to backend
    const request: ModifyEquipmentAmount = { equipmentId: selectedItem, amount };
    apiDecreaseQuantity(currentInventory.id, request, token ?? "");

    setSelectedItem(null);
    setRemoveModalOpened(false);

    showNotification({
      id: selectedItem,
      title: "Item Removed Successfully!",
      color: SectionColor.Green,
      icon: <IconCheck />,
      message: "",
    });
  };

  const handleConfirmMove = async (targetInventoryId: string, amount: number) => {
    if (!moveItemId || !currentInventory?.id || !token) return;

    try {
      const request : MoveItemRequest = {
        targetInventoryId,
        amount,
      }
      await moveItem(currentInventory.id, moveItemId, request, token);

      useInventoryStore.getState().moveItem(currentInventory.id, targetInventoryId, moveItemId, amount);

      showNotification({
        id: moveItemId,
        title: "Item moved successfully!",
        color: SectionColor.Blue,
        icon: <IconCheck />,
        message: "",
      });
    } catch (error) {
      console.error("Move failed:", error);
      showNotification({
        id: moveItemId,
        title: "Failed to move item",
        color: SectionColor.Red,
        message: "Check console for details",
      });
    } finally {
      setMoveModalOpened(false);
      setMoveItemId(null);
    }
  };

  if (loading)
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );

  if (!currentInventory)
    return (
      <Text c="dimmed" size="sm" ta="center">
        Inventory data not available.
      </Text>
    );

  return (
    <>
      <RemoveItemModal
        opened={removeModalOpened}
        onClose={() => setRemoveModalOpened(false)}
        onConfirm={handleConfirmRemove}
        itemName={currentInventory.name || "Unnamed Inventory"}
        maxAmount={
          currentInventory.items?.find((i) => i.equipmentId === selectedItem)?.quantity ?? 0
        }
      />
      
      <MoveItemModal
        opened={moveModalOpened}
        onClose={() => {
          setMoveModalOpened(false);
          setMoveItemId(null);
        }}
        inventories={inventories}
        currentInventoryId={currentInventory.id!}
        itemId={moveItemId}
        onConfirm={(targetInventoryId, amount) => handleConfirmMove(targetInventoryId, amount)}
      />
      
      <ExpandableSection
        title={currentInventory.name || "Undefined Inventory"}
        defaultOpen={false}
        color={
          currentInventory.name === "Equipment"
            ? SectionColor.Yellow
            : SectionColor.Grape
        }
      >

      <Stack gap="xs" mt={"xs"}>
        {currentInventory.items?.length ? (
          currentInventory.items.map((item) => (
            <InventoryItemCard
              key={item.equipmentId}
              item={item}
              onRemove={handleRemoveClick}
              onMove={handleMoveClick}
            />
          ))
        ) : (
          <Text c="dimmed" size="sm" ta="center">
            No items in this inventory.
          </Text>
        )}

        <InventoryCurrencyClaim inventoryId={inventory.id!}/>
      </Stack>

      </ExpandableSection>
    </>
  );
}
