import { Group, Stack, TextInput } from "@mantine/core";
import { useCharacterFormStore } from "@store/character/characterFormStore";

import { FormNumberInput } from "@components/common/FormNumberInput";
import { classHitDice } from "@utils/hitDice";

export function CombatStatsSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const input = { input: "glassy-input", label: "glassy-label" };

  return (
    <Stack>

      <Group grow>
        <FormNumberInput
          label="HP"
          min={0}
          max={characterForm.maxHitPoints || 999}
          classNames={input}
          value={characterForm.hitPoints}
          onChange={(v) => setCharacterForm({ hitPoints: v })}
        />

        <FormNumberInput
          label="Max HP"
          min={1}
          max={999}
          classNames={input}
          value={characterForm.maxHitPoints}
          onChange={(v) => setCharacterForm({ maxHitPoints: v })}
        />
      </Group>

      <Group grow>
        <FormNumberInput
          label="Temp HP"
          min={0}
          max={200}
          classNames={input}
          value={characterForm.temporaryHitPoints}
          onChange={(v) =>
            setCharacterForm({ temporaryHitPoints: v })
          }
        />
      </Group>

      <Group grow>
        <FormNumberInput
          label="Armor Class"
          min={0}
          classNames={input}
          value={characterForm.armorClass}
          onChange={(v) => setCharacterForm({ armorClass: v })}
        />

        <FormNumberInput
          label="Speed (ft)"
          min={0}
          classNames={input}
          value={characterForm.speed}
          onChange={(v) => setCharacterForm({ speed: v })}
        />
      </Group>

      <Group grow>
        <FormNumberInput
          label="Initiative"
          min={-99}
          classNames={input}
          value={characterForm.initiative}
          onChange={(v) => setCharacterForm({ initiative: v })}
        />

        {/* Worked out from the class hit dice on the Basic Info tab. */}
        <TextInput
          label="Hit Dice"
          placeholder="Pick your class hit die"
          classNames={input}
          value={classHitDice(characterForm) ?? characterForm.hitDice}
          readOnly
          disabled
        />
      </Group>

    </Stack>
  );
}
