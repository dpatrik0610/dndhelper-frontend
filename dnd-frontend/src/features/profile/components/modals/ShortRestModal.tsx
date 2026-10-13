import { useState, useEffect } from "react";
import { Stack, Text } from "@mantine/core";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { updateCharacter } from "@services/characterService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { BaseModal } from "@components/BaseModal";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { abilityMod, computeEffects, signed } from "@utils/effects";
import { hitDicePool, shortRest } from "@utils/hitDice";

interface ShortRestModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ShortRestModal({ opened, onClose }: ShortRestModalProps) {
  const character = useCurrentCharacter();
  const { setCharacter } = useCharacterCoreActions();

  const [spend, setSpend] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) setSpend({});
  }, [opened]);

  if (!character) return null;

  const { stats } = computeEffects(character);
  const conMod = abilityMod(stats.con.value);
  const maxHp = stats.maxHp.value;
  const pool = hitDicePool(character);
  const refills = (character.classResources ?? []).filter((r) => r.recharge === "short");

  const handleRest = async () => {
    setSaving(true);
    try {
      const { patch, rolls, healed } = shortRest(character, spend, conMod, maxHp);
      const updated = await updateCharacter({ ...character, ...patch });
      if (!updated) throw new Error("Could not save the character.");
      setCharacter(updated);

      const rolled = rolls.length ? `Rolled ${rolls.map((r) => `${r.die}: ${r.roll}`).join(", ")} (${signed(conMod)} CON each). ` : "";
      showNotification({
        title: "Short rest",
        message: `${rolled}Healed ${healed} HP (now ${patch.hitPoints}/${maxHp}).${refills.length ? ` Refilled ${refills.map((r) => r.name).join(", ")}.` : ""}`,
        color: SectionColor.Green,
      });
      onClose();
    } catch (err) {
      showNotification({ title: "Short rest failed", message: String(err), color: SectionColor.Red });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal opened={opened} onClose={onClose} title="Take a short rest?" showCancelButton onSave={handleRest} saveLabel="Rest" loading={saving} size="sm">
      <Stack gap="md">
        <Text size="sm">
          HP {character.hitPoints ?? 0} / {maxHp}. Each hit die heals its roll {signed(conMod)} (CON).
        </Text>

        {pool.length ? (
          pool.map((d) => (
            <FormNumberInput
              key={d.die}
              label={`${d.die} to spend (${d.left} of ${d.total} left)`}
              min={0}
              max={d.left}
              disabled={!d.left}
              value={spend[d.die] ?? 0}
              onChange={(v) => setSpend((s) => ({ ...s, [d.die]: v }))}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          ))
        ) : (
          <Text size="sm" c="dimmed">
            No hit dice on the sheet. Set them on the edit page, e.g. "3d10+2d8".
          </Text>
        )}

        <Text size="xs" c="dimmed">
          {refills.length ? `Refills: ${refills.map((r) => r.name).join(", ")}.` : "No resources recharge on a short rest."}
        </Text>
      </Stack>
    </BaseModal>
  );
}
