import { Stack, Select, NumberInput } from "@mantine/core";
import { useState, useEffect } from "react";
import { useAdminInventoryStore } from "../../../../../store/admin/useAdminInventoryStore";
import { BaseModal } from "../../../../../components/BaseModal";
import { showNotification } from "../../../../../components/Notification/Notification";
import { SectionColor } from "../../../../../types/SectionColor";

interface MoveItemModalProps {
  opened: boolean;
  onClose: () => void;
  itemId: string;
}

export function MoveItemModal({ opened, onClose, itemId }: MoveItemModalProps) {
  const { inventories, selected, moveItem } =
    useAdminInventoryStore();
  const [targetId, setTargetId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);

  const currentItem = selected?.items?.find((i) => i.equipmentId === itemId);
  const max = currentItem?.quantity ?? 1;

  useEffect(() => {
    if (!opened) {
      setTargetId(null);
      setAmount(1);
    }
  }, [opened]);

  const otherInventories = inventories
    .filter((i) => i.id !== selected?.id)
    .map((i) => ({
      value: i.id!,
      label: i.name || "Unnamed Inventory",
    }));

  const handleMove = async () => {
    if (!targetId || !currentItem || !selected) {
      showNotification({
        title: "Error",
        message: "Select a valid target inventory.",
        color: SectionColor.Red,
      });
      return;
    }

    try {
      await moveItem(currentItem.equipmentId!, targetId, amount);

      onClose();
    } catch (err) {
      showNotification({
        title: "Error moving item",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Move Item"
      onSave={handleMove}
      saveLabel="Move"
    >
      <Stack>
        <Select
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          label="Target Inventory"
          placeholder="Choose inventory"
          data={otherInventories}
          value={targetId}
          onChange={setTargetId}
        />
        <NumberInput
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          label="Amount"
          min={1}
          max={max}
          value={amount}
          onChange={(v) => setAmount(Number(v ?? 1))}
        />
      </Stack>
    </BaseModal>
  );
}
