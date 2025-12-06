import { useState } from "react";
import { Modal, Button, Stack, Text, Select } from "@mantine/core";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { updateCharacter } from "../../../services/characterService";
import { useAuthStore } from "../../../store/useAuthStore";
import { FormNumberInput } from "../../../components/common/FormNumberInput";

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
    await updateCharacter(useCharacterStore.getState().character!, token);

    setSelected(null);
    setAmount(0);
    onClose();
  }

  const getCurrencyName = (t: string) =>
    ({ gp: "Gold", sp: "Silver", cp: "Copper", pp: "Platinum", ep: "Electrum" }[t] ?? "Unknown");

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
            option: { "&[data-hovered]": { background: "rgba(255,90,90,0.2)" } },
          }}
        />

        {selected && (
          <FormNumberInput
            label="Amount to remove"
            min={1}
            max={selectedCurrency?.amount ?? 1}
            value={amount}
            onChange={(v) => setAmount(v)}
            hideControls
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />
        )}

        <Button onClick={handleRemove} disabled={!selected || !amount} color="red">
          Remove
        </Button>
      </Stack>
    </Modal>
  );
}
