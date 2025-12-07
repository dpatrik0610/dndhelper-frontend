import { useState } from "react";
import { NumberInput, Stack, Text } from "@mantine/core";
import { useCharacterStore } from "@store/useCharacterStore";
import { useAuthStore } from "@store/useAuthStore";
import { updateCharacter } from "@services/characterService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { BaseModal } from "@components/BaseModal";

interface HealModalProps {
  opened: boolean;
  onClose: () => void;
}

export function HealModal({ opened, onClose }: HealModalProps) {
  const character = useCharacterStore((state) => state.character);
  const setCharacter = useCharacterStore((state) => state.setCharacter);
  const token = useAuthStore.getState().token!;
  const [amount, setAmount] = useState<number | string>(5);
  const [saving, setSaving] = useState(false);

  if (!character) return null;

  const currentHp = character.hitPoints ?? 0;
  const maxHp = character.maxHitPoints ?? currentHp;

  const handleHeal = async () => {
    if (!amount || Number(amount) <= 0) return;
    const healVal = Number(amount);
    const nextHp = Math.min(currentHp + healVal, maxHp);

    setSaving(true);
    try {
      const updated = await updateCharacter(
        {
          ...character,
          hitPoints: nextHp,
        },
        token
      );

      if (updated) setCharacter(updated);
      showNotification({
        title: "Healed",
        message: `Recovered ${healVal} HP (now ${nextHp}/${maxHp}).`,
        color: SectionColor.Green,
      });
      onClose();
    } catch (err) {
      showNotification({
        title: "Heal failed",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Heal"
      showCancelButton
      onSave={handleHeal}
      saveLabel="Heal"
      loading={saving}
      size="sm"
    >
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Current HP: {currentHp} / {maxHp}
        </Text>

        <NumberInput
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          label="Heal amount"
          value={amount}
          onChange={setAmount}
          min={1}
          max={Math.max(1, maxHp - currentHp)}
        />
      </Stack>
    </BaseModal>
  );
}
