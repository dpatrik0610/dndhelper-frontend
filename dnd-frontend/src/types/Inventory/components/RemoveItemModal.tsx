import { useEffect, useState } from "react";
import { Modal, NumberInput, Button, Group, Text } from "@mantine/core";

interface RemoveItemModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  itemName?: string;
  maxAmount? : number;
}

export function RemoveItemModal({ opened, onClose, onConfirm, itemName, maxAmount }: RemoveItemModalProps) {
  const [amount, setAmount] = useState(1);

  // Each open starts from 1, not whatever was removed last time.
  useEffect(() => {
    if (opened) setAmount(1);
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title={`Remove ${itemName || "item"}`} centered>
      <Text size="sm" mb="xs">
        How many would you like to remove?
      </Text>

      <NumberInput
        min={1}
        max={maxAmount}
        value={amount}
        onChange={(val) => setAmount(Number(val) || 1)}
        placeholder="Amount"
        label="Quantity"
        description={maxAmount ? `You have ${maxAmount}` : undefined}
        mb="md"
      />

      <Group justify="flex-end">
        <Button variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={() => onConfirm(maxAmount ? Math.min(amount, maxAmount) : amount)}>
          Remove
        </Button>
      </Group>
    </Modal>
  );
}
