import { useState, useEffect } from "react";
import { Modal, Select, Button, Stack, NumberInput } from "@mantine/core";
import type { Inventory } from "../../../types/Inventory/Inventory";

interface MoveItemModalProps {
  opened: boolean;
  onClose: () => void;
  inventories: Inventory[];
  currentInventoryId: string;
  itemId: string | null;
  onConfirm: (targetInventoryId: string, amount: number) => void;
}

export function MoveItemModal({ opened, onClose, inventories, currentInventoryId, itemId, onConfirm }: MoveItemModalProps) {
  const [targetInventory, setTargetInventory] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [maxAmount, setMaxAmount] = useState<number>(1);

  // Update maxAmount based on current inventory and item
  useEffect(() => {
    if (!itemId) return;
    const currentInventory = inventories.find(i => i.id === currentInventoryId);
    const item = currentInventory?.items?.find(i => i.equipmentId === itemId);
    setMaxAmount(item?.quantity ?? 1);
    setAmount(item?.quantity ?? 1);
  }, [itemId, currentInventoryId, inventories]);

  const otherInventories = inventories
    .filter(i => i.id !== currentInventoryId)
    .map(i => ({ value: i.id!, label: i.name! }));

  return (
    <Modal opened={opened} onClose={onClose} title="Move Item">
      <Stack>
        <Select
          label="Target Inventory"
          placeholder="Select inventory"
          data={otherInventories}
          value={targetInventory}
          onChange={setTargetInventory}
        />
        <NumberInput
          label="Amount to move"
          min={1}
          max={maxAmount}
          value={amount}
          onChange={(val) => setAmount(Number(val ?? 1))}
        />
        <Button
          disabled={!targetInventory || amount < 1}
          onClick={() => {
            if (!targetInventory) return;
            onConfirm(targetInventory, amount);
          }}
        >
          Move
        </Button>
      </Stack>
    </Modal>
  );
}