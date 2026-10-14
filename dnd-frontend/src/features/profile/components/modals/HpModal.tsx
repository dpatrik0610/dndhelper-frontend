import { useState, useEffect } from "react";
import { Stack, Text } from "@mantine/core";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { updateCharacter } from "@services/characterService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { BaseModal } from "@components/BaseModal";
import { computeEffects } from "@utils/effects";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { applyHp } from "@utils/hp";

interface HpModalProps {
  opened: boolean;
  onClose: () => void;
}

export function HpModal({ opened, onClose }: HpModalProps) {
  const character = useCurrentCharacter();
  const { setCharacter, updateCharacter: updateCharacterLocal } = useCharacterCoreActions();

  const [amount, setAmount] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) {
      setAmount(0);
    }
  }, [opened]);

  if (!character) return null;

  const currentHp = character.hitPoints ?? 0;
  const maxHp = computeEffects(character).stats.maxHp.value || currentHp;
  const tempHp = character.temporaryHitPoints ?? 0;

  const handleApply = async () => {
    if (!amount) return;

    setSaving(true);
    try {
      const { patch, message, concentration } = applyHp(character, amount);
      const updated = await updateCharacter({ ...character, ...patch });

      if (updated) {
        setCharacter(updated);
      } else {
        updateCharacterLocal(patch);
      }

      showNotification({
        title: amount >= 0 ? "Healed" : "Damage Applied",
        message,
        color: amount >= 0 ? SectionColor.Green : SectionColor.Red,
      });
      if (concentration) {
        showNotification({ title: "Concentration check", message: concentration, color: SectionColor.Yellow });
      }

      onClose();
    } catch (err) {
      showNotification({
        title: "Action failed",
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
      title="Manage HP"
      showCancelButton
      onSave={handleApply}
      saveLabel={amount < 0 ? "Damage" : "Heal"}
      loading={saving}
      size="sm"
    >
      <Stack gap="md">
        <Stack gap={2} align="center">
          <Text size="sm" c="dimmed">
            Current HP
          </Text>
          <Text size="xl" fw={700}>
            {currentHp} / {maxHp}
          </Text>
          {tempHp > 0 && (
            <Text size="xs" fw={700} c="yellow.4">
              +{tempHp} Temporary HP
            </Text>
          )}
        </Stack>

        <FormNumberInput
          label="Amount (negative for damage)"
          min={undefined}
          value={amount}
          onChange={(v) => setAmount(v)}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          hideControls
        />
      </Stack>
    </BaseModal>
  );
}
