import { Group, Stack, TextInput } from "@mantine/core";
import { IconSword } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";

import { FormNumberInput } from "../../../components/common/FormNumberInput";
// import { WheelPickerInput } from "../../../components/common/WheelPickerInput"; // 🔧 Disabled for now

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
        {/* 🔥 HP + MAX HP → NORMAL Number Inputs     */}
        {/* ---------------------------------------- */}
        <Group grow>
          {/* WheelPickerInput temporarily disabled */}
          {/* 
          <WheelPickerInput ... />
          */}
          <FormNumberInput
            label="HP"
            min={0}
            max={characterForm.maxHitPoints || 999}
            classNames={input}
            value={characterForm.hitPoints}
            onChange={(v) => setCharacterForm({ hitPoints: v })}
          />

          {/* WheelPickerInput temporarily disabled */}
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
          {/* WheelPickerInput temporarily disabled */}
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

        {/* ---------------------------------------- */}
        {/* Armor Class + Speed                      */}
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
        {/* Initiative + XP + Hit Dice               */}
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
            onChange={(e) => setCharacterForm({ hitDice: e.currentTarget.value })}
          />
        </Group>

      </Stack>
    </ExpandableSection>
  );
}
