import { useState } from "react";
import { Stack, Text } from "@mantine/core";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { longrest } from "@services/characterService";
import { loadCharacters } from "@utils/loadCharacter";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { BaseModal } from "@components/BaseModal";
import { computeEffects } from "@utils/effects";
import { hitDicePool } from "@utils/hitDice";

interface LongRestModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Mirrors CharacterService.LongRestAsync on the backend. */
export function LongRestModal({ opened, onClose }: LongRestModalProps) {
  const character = useCurrentCharacter();
  const [saving, setSaving] = useState(false);

  if (!character?.id) return null;

  const maxHp = computeEffects(character).stats.maxHp.value;
  const pool = hitDicePool(character);
  const total = pool.reduce((n, d) => n + d.total, 0);
  const spent = pool.reduce((n, d) => n + d.total - d.left, 0);
  const regained = Math.min(spent, Math.max(1, Math.floor(total / 2)));
  const refills = (character.classResources ?? []).filter((r) => r.recharge !== "none");

  const handleRest = async () => {
    setSaving(true);
    try {
      const { success, message } = await longrest(character.id!);
      if (!success) throw new Error(message);
      await loadCharacters();
      showNotification({ id: "longrest-success", title: "Long rest", message: "You slept through the night 🙂", color: SectionColor.Green });
      onClose();
    } catch (err) {
      showNotification({ title: "Long rest failed", message: String(err), color: SectionColor.Red });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal opened={opened} onClose={onClose} title="Take a long rest?" showCancelButton onSave={handleRest} saveLabel="Rest" loading={saving} size="sm">
      <Stack gap="md">
        <Text size="sm">
          HP {character.hitPoints ?? 0} / {maxHp}. {character.name || "Your character"} regains all hit points and spell slots.
        </Text>

        {total > 0 && (
          <Text size="sm">
            Regains {regained} hit {regained === 1 ? "die" : "dice"} ({total - spent + regained} of {total} after resting).
          </Text>
        )}

        <Text size="xs" c="dimmed">
          {refills.length ? `Refills: ${refills.map((r) => r.name).join(", ")}. ` : ""}Temporary hit points and death saves are reset.
        </Text>
      </Stack>
    </BaseModal>
  );
}
