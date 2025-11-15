import { Group, Stack, TextInput } from "@mantine/core";
import { IconSword } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import "../../../styles/glassyInput.css";

import { FormNumberInput } from "../../../components/common/FormNumberInput";
import { WheelPickerInput } from "../../../components/common/WheelPickerInput";

export function CombatStatsSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const input = { input: "glassy-input", label: "glassy-label" };

  return (
    <ExpandableSection
      title="Combat Statistics"
      icon={<IconSword />}
      color={SectionColor.Red}
      defaultOpen
    >
      <Stack>

        {/* ---------------------------------------- */}
        {/* 🔥 HP + MAX HP → moved to VERY TOP        */}
        {/* ---------------------------------------- */}
        <Group grow>
          <WheelPickerInput
            items={Array.from(
              { length: characterForm.maxHitPoints + 1 },
              (_, i) => i
            )}
            label="HP"
            value={characterForm.hitPoints}
            onChange={(v) => setCharacterForm({ hitPoints: v })}
            height={90}
          />

          <WheelPickerInput
            items={Array.from({ length: 401 }, (_, i) => i + 1)}
            label="Max HP"
            value={characterForm.maxHitPoints}
            onChange={(v) => setCharacterForm({ maxHitPoints: v })}
            height={90}
          />
        </Group>

        <Group grow>
          <WheelPickerInput
            items={Array.from({ length: 201 }, (_, i) => i)}
            label="Temp HP"
            value={characterForm.temporaryHitPoints}
            onChange={(v) => setCharacterForm({ temporaryHitPoints: v })}
            height={50}
          />
        </Group>

        {/* ---------------------------------------- */}
        {/* 🔧 Armor Class + Speed → back to number input */}
        {/* ---------------------------------------- */}
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

        {/* ---------------------------------------- */}
        {/* Initiative, Experience → Number inputs */}
        {/* ---------------------------------------- */}
        <Group grow>
          <FormNumberInput
            label="Initiative"
            min={-99}
            classNames={input}
            value={characterForm.initiative}
            onChange={(v) => setCharacterForm({ initiative: v })}
          />

          <FormNumberInput
            label="Experience"
            min={0}
            classNames={input}
            value={characterForm.experience}
            onChange={(v) => setCharacterForm({ experience: v })}
          />

          <TextInput
            label="Hit Dice"
            placeholder="e.g., 1d10"
            classNames={input}
            value={characterForm.hitDice}
            onChange={(e) =>
              setCharacterForm({ hitDice: e.currentTarget.value })
            }
          />
        </Group>

      </Stack>
    </ExpandableSection>
  );
}
