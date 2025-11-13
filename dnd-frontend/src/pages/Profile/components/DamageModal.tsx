// DamageModal.tsx
import { useState } from "react";
import { Modal, NumberInput, Button, Stack } from "@mantine/core";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { updateCharacter } from "../../../services/characterService";

interface DamageModalProps {
  opened: boolean;
  onClose: () => void;
}

export function DamageModal({ opened, onClose }: DamageModalProps) {
  const token = useAuthStore.getState().token!;
  const character = useCharacterStore((s) => s.character)!;
  const updateCharacterLocal = useCharacterStore((s) => s.updateCharacter);

  const [amount, setAmount] = useState<number>(0);

  const handleDamage = async () => {
    if (!amount || amount <= 0) return;

    const newHP = Math.max(0, character.hitPoints - amount);

    updateCharacterLocal({ hitPoints: newHP });

    const updated = useCharacterStore.getState().character!;
    await updateCharacter(updated, token);

    onClose();
    setAmount(0);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Apply Damage"
      centered
      styles={{
        header: { background: "rgba(20,0,0,0.45)" },
        content: {
          background: "rgba(20,0,0,0.45)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,100,100,0.2)",
          boxShadow: "0 0 12px rgba(255,60,60,0.25)",
        },
        title: {
          color: "white",
          textShadow: "0 0 6px rgba(255,80,80,0.7)",
        },
      }}
    >
      <Stack gap="md">
        <NumberInput
          label="Damage Amount"
          value={amount}
          min={1}
          onChange={(v) => setAmount(Number(v))}
          styles={{
            input: {
              background: "rgba(255,255,255,0.06)",
              color: "white",
              border: "1px solid rgba(255,80,80,0.25)",
              backdropFilter: "blur(6px)",
            },
            label: { color: "white" },
          }}
        />

        <Button disabled={!amount} onClick={handleDamage} variant="gradient" gradient={{ from: "red", to: "darkred", deg: 145 }}>
          Apply Damage
        </Button>
      </Stack>
    </Modal>
  );
}
