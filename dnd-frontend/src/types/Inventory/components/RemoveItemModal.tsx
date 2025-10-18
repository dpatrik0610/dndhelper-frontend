import { useState } from "react";
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

  return (
    <Modal opened={opened} onClose={onClose} title={`Remove from ${itemName || "inventory"}`} centered>
      <Text size="sm" mb="xs">
        How many items would you like to remove?
      </Text>

      <NumberInput
        min={1}
        max={maxAmount}
        value={amount}
        onChange={(val) => setAmount(Number(val) || 1)}
        placeholder="Amount"
        label="Quantity"
        mb="md"
      />

      <Group justify="flex-end">
        <Button variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={() => onConfirm(amount)}>
          Remove
        </Button>
      </Group>
    </Modal>
  );
}
