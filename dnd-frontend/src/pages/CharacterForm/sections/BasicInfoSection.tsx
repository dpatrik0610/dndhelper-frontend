import { Stack, Group, TextInput, Select } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import { FormNumberInput } from "../../../components/common/FormNumberInput";
import { InfoIconPopover } from "../../../components/common/InfoIconPopover";
import { useEffect } from "react";
import "../../../styles/glassyInput.css";

const ALIGNMENTS = [
  "Lawful Good","Neutral Good","Chaotic Good",
  "Lawful Neutral","True Neutral","Chaotic Neutral",
  "Lawful Evil","Neutral Evil","Chaotic Evil",
];

export function BasicInfoSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const cls = { input: "glassy-input", label: "glassy-label" };

  // label helper
  const L = (label: string, info: string | null = null) => (
    <Group gap={4} align="center" wrap="nowrap">
      <span>{label}</span>
      {info && <InfoIconPopover title={label}>{info}</InfoIconPopover>}
    </Group>
  );

  // ⭐ Auto-compute proficiency bonus from level
  useEffect(() => {
    const pb = Math.floor((characterForm.level - 1) / 4) + 2;
    if (pb !== characterForm.proficiencyBonus) {
      setCharacterForm({ proficiencyBonus: pb });
    }
  }, [characterForm.level]);

  return (
    <ExpandableSection
      title="Basic Information"
      icon={<IconUser />}
      color={SectionColor.White}
      defaultOpen
    >
      <Stack gap={8}>

        {/* NAME */}
        <TextInput
          classNames={cls}
          label={L("Name", "Your character’s chosen name.")}
          required
          value={characterForm.name}
          onChange={(e) => setCharacterForm({ name: e.currentTarget.value })}
        />

        {/* RACE + CLASS */}
        <Group grow gap={8}>
          <TextInput
            classNames={cls}
            label={L("Race", "Determines innate traits and abilities.")}
            value={characterForm.race}
            onChange={(e) => setCharacterForm({ race: e.currentTarget.value })}
          />

          <TextInput
            classNames={cls}
            label={L("Class", "Defines your combat role and progression.")}
            value={characterForm.characterClass}
            onChange={(e) => setCharacterForm({ characterClass: e.currentTarget.value })}
          />
        </Group>

        {/* BACKGROUND + INSPIRATION */}
        <Group grow gap={8}>
          <TextInput
            classNames={cls}
            label={L("Background", "Your life before adventuring.")}
            value={characterForm.background}
            onChange={(e) => setCharacterForm({ background: e.currentTarget.value })}
          />

          <FormNumberInput
            classNames={cls}
            label={L("Inspiration", "Spend for advantage on a roll.")}
            value={characterForm.inspiration}
            onChange={(v) => setCharacterForm({ inspiration: v })}
          />
        </Group>

        {/* LEVEL + AUTOMATIC PROF BONUS */}
        <Group grow gap={8}>

          <FormNumberInput
            classNames={cls}
            label={L("Level", "Overall character level (1–20).")}
            min={1}
            max={20}
            value={characterForm.level}
            onChange={(v) => setCharacterForm({ level: v })}
          />

          <TextInput
            classNames={cls}
            label={L("Proficiency Bonus", "Auto-calculated from level: \n(CharacterLevel - 1) / 4) + 2")}
            value={`+${characterForm.proficiencyBonus}`}
            readOnly
            disabled
          />
        </Group>

        {/* ALIGNMENT */}

        <Select 
        data={ALIGNMENTS}
        label="Alignment"
        value={characterForm.alignment}
        onChange={(v) => setCharacterForm({ alignment: v! })}
        classNames={{...cls, dropdown: "glassy-dropdown", option: "glassy-option"}}
        />
      </Stack>
    </ExpandableSection>
  );
}
