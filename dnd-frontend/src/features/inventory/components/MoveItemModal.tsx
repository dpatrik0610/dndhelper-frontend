import { useState, useEffect } from "react";
import { Stack, Select, NumberInput } from "@mantine/core";
import { BaseModal } from "@components/BaseModal";
import type { Inventory } from "@appTypes/Inventory/Inventory";

interface MoveItemModalProps {
  opened: boolean;
  onClose: () => void;
  inventories: Inventory[];
  currentInventoryId: string;
  itemId: string | null;
  onConfirm: (targetInventoryId: string, amount: number) => void;
}

export function MoveItemModal({
  opened,
  onClose,
  inventories,
  currentInventoryId,
  itemId,
  onConfirm,
}: MoveItemModalProps) {
  const [targetInventory, setTargetInventory] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [maxAmount, setMaxAmount] = useState<number>(1);

  useEffect(() => {
    if (!itemId) return;
    const currentInventory = inventories.find((i) => i.id === currentInventoryId);
    const item = currentInventory?.items?.find((i) => i.equipmentId === itemId);
    setMaxAmount(item?.quantity ?? 1);
    setAmount(item?.quantity ?? 1);
  }, [itemId, currentInventoryId, inventories]);

  const otherInventories = inventories
    .filter((i) => i.id && i.id !== currentInventoryId)
    .map((i) => ({ value: i.id!, label: i.name || "Unnamed Inventory" }));

  const handleConfirm = () => {
    if (!targetInventory) return;
    onConfirm(targetInventory, amount);
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Move Item"
      onSave={handleConfirm}
      saveLabel="Move"
      showSaveButton
      showCancelButton
    >
      <Stack>
        <Select
          classNames={{input: "glassy-input", label: "glassy-label"}}
          label="Target Inventory"
          placeholder="Select inventory"
          data={otherInventories}
          value={targetInventory}
          onChange={setTargetInventory}
          key={otherInventories.map((inv) => inv.value).join("-")}
        />
        <NumberInput
          classNames={{input: "glassy-input", label: "glassy-label"}}
          label="Amount to move"
          min={1}
          max={maxAmount}
          value={amount}
          onChange={(val) => setAmount(Number(val ?? 1))}
        />
      </Stack>
    </BaseModal>
  );
}


