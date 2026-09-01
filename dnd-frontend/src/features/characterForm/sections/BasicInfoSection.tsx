import { Stack, Group, TextInput, Select } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { InfoIconPopover } from "@components/common/InfoIconPopover";
import { useEffect } from "react";
import { getLevelForExperience } from "@utils/experienceTable";

const ALIGNMENTS = [
  "Lawful Good","Neutral Good","Chaotic Good",
  "Lawful Neutral","True Neutral","Chaotic Neutral",
  "Lawful Evil","Neutral Evil","Chaotic Evil",
];

export function BasicInfoSection({ noBox = false }: { noBox?: boolean }) {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const cls = { input: "glassy-input", label: "glassy-label" };

  // label helper
  const L = (label: string, info: string | null = null) => (
    <Group gap={4} align="center" wrap="nowrap">
      <span>{label}</span>
      {info && <InfoIconPopover title={label}>{info}</InfoIconPopover>}
    </Group>
  );

  // Auto-compute Level and Proficiency Bonus from Experience (XP)
  useEffect(() => {
    const xp = characterForm.experience ?? 0;
    const progression = getLevelForExperience(xp);
    if (
      progression.level !== characterForm.level ||
      progression.proficiencyBonus !== characterForm.proficiencyBonus
    ) {
      setCharacterForm({
        level: progression.level,
        proficiencyBonus: progression.proficiencyBonus,
      });
    }
  }, [characterForm.experience, characterForm.level, characterForm.proficiencyBonus]);

  const content = (
    <Stack gap={8}>

      {/* NAME */}
      <TextInput
        classNames={cls}
        label={L("Name", "Your character's chosen name.")}
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

      {/* BACKGROUND + ALIGNMENT */}
      <Group grow gap={8}>
        <TextInput
          classNames={cls}
          label={L("Background", "Your life before adventuring.")}
          value={characterForm.background}
          onChange={(e) => setCharacterForm({ background: e.currentTarget.value })}
        />

        <Select 
          data={ALIGNMENTS}
          label="Alignment"
          value={characterForm.alignment}
          onChange={(v) => setCharacterForm({ alignment: v! })}
          classNames={{...cls, dropdown: "glassy-dropdown", option: "glassy-option"}}
        />
      </Group>

      {/* PROGRESSION: XP (EDITABLE), LEVEL (AUTO), PROF BONUS (AUTO) */}
      <Group grow gap={8}>
        <FormNumberInput
          classNames={cls}
          label={L("Experience Points (XP)", "Your total accumulated experience. Level and Proficiency Bonus will auto-compute.")}
          min={0}
          value={characterForm.experience}
          onChange={(v) => setCharacterForm({ experience: v })}
        />

        <TextInput
          classNames={cls}
          label="Calculated Level"
          value={`Level ${characterForm.level}`}
          readOnly
          disabled
          styles={{ input: { opacity: 0.85, fontWeight: 600, color: "var(--theme-color-accent-primary)" } }}
        />

        <TextInput
          classNames={cls}
          label="Proficiency Bonus"
          value={`+${characterForm.proficiencyBonus}`}
          readOnly
          disabled
          styles={{ input: { opacity: 0.85, fontWeight: 600, color: "var(--theme-color-accent-secondary)" } }}
        />
      </Group>

      {/* INSPIRATION */}
      <FormNumberInput
        classNames={cls}
        label={L("Inspiration", "Spend for advantage on a roll.")}
        value={characterForm.inspiration}
        onChange={(v) => setCharacterForm({ inspiration: v })}
      />

    </Stack>
  );

  if (noBox) return content;

  return (
    <ExpandableSection
      title="Basic Information"
      icon={<IconUser />}
      color={SectionColor.White}
      defaultOpen
    >
      {content}
    </ExpandableSection>
  );
}