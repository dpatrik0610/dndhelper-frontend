import { useState } from "react";
import { Modal, Button, Stack, NumberInput, Text, Select } from "@mantine/core";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { updateCharacter } from "../../../services/characterService";
import { useAuthStore } from "../../../store/useAuthStore";

interface RemoveCurrencyModalProps {
  opened: boolean;
  onClose: () => void;
}

export function RemoveCurrencyModal({ opened, onClose }: RemoveCurrencyModalProps) {
  const character = useCharacterStore((s) => s.character);
  const removeCurrencyLocal = useCharacterStore((s) => s.removeCurrency);
  const token = useAuthStore.getState().token!;

  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);

  if (!character) return null;

  const currencies = character.currencies ?? [];
  const selectedCurrency = currencies.find((c) => c.type === selected);

  async function handleRemove() {
    if (!selected || !amount) return;

    removeCurrencyLocal(selected, amount);

    const updated = useCharacterStore.getState().character!;
    await updateCharacter(updated, token);

    setSelected(null);
    setAmount(0);
    onClose();
  }

  function getCurrencyName(curr: string) {
    switch (curr) {
        case "gp":
            return "Gold";
        case "sp":
            return "Silver";
        case "cp":
            return "Copper";
        case "pp":
            return "Platinum";
        case "ep":
            return "Electrum";
        default:
            return "Unknown";
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title="Remove Currency"
      styles={{
        header: { background: "transparent" },
        content: {
          background: "rgba(20,0,0,0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,90,90,0.25)",
        },
        title: {
          color: "white",
          textShadow: "0 0 6px rgba(255,80,80,0.7)",
        },
      }}
    >
      <Stack gap="md">
        {currencies.length === 0 && (
          <Text ta="center" c="gray.4">No currencies to remove.</Text>
        )}

        {/* SIMPLE SELECT */}
        <Select
          label="Currency"
          placeholder="Choose a currency"
          value={selected}
          onChange={setSelected}
          data={currencies.map((c) => ({
            value: c.type,
            label: `${getCurrencyName(c.type)} (${c.amount} ${c.currencyCode})`,
          }))}
          styles={{
            input: {
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1px solid rgba(255,100,100,0.3)",
              backdropFilter: "blur(6px)",
            },
            label: { color: "white" },
            dropdown: {
              background: "rgba(20,0,0)",
              border: "1px solid rgba(255,90,90,0.25)",
            },
            option: {
              "&[data-hovered]": {
                background: "rgba(255,90,90,0.2)",
              },
            },
          }}
        />

        {/* AMOUNT */}
        {selected && (
          <NumberInput
            label={`Amount to remove`}
            value={amount}
            min={1}
            max={selectedCurrency?.amount ?? 1}
            onChange={(v) => setAmount(Number(v))}
            styles={{
              input: {
                background: "rgba(255,255,255,0.05)",
                color: "white",
                border: "1px solid rgba(255,60,60,0.3)",
                backdropFilter: "blur(6px)",
              },
              label: { color: "white" },
            }}
          />
        )}

        {/* BUTTON */}
        <Button onClick={handleRemove} disabled={!selected || !amount}>
          Remove
        </Button>
      </Stack>
    </Modal>
  );
}
