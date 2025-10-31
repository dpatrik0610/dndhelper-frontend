import { Group, NumberInput, Select, Stack, TextInput, Tooltip } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import "../styles/glassyInput.css"

export function BasicInfoSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  return (
    <ExpandableSection title="Basic Information" icon={<IconUser />} color={SectionColor.White} defaultOpen>
      <Stack>
        <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Name" required value={characterForm.name} onChange={(e) => setCharacterForm({ name: e.currentTarget.value })}  />

        <Group grow>
          <Tooltip label="A character’s species — affects abilities, features, and traits (e.g., Elf, Human, Dragonborn)." color="dark" withArrow multiline maw={260}>
            <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Race" value={characterForm.race} onChange={(e) => setCharacterForm({ race: e.currentTarget.value })}  />
          </Tooltip>

          <Tooltip label="Defines your role, abilities, and spellcasting — e.g., Fighter, Rogue, Wizard." color="dark" withArrow multiline maw={260}>
            <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Class" value={characterForm.characterClass} onChange={(e) => setCharacterForm({ characterClass: e.currentTarget.value })}  />
          </Tooltip>
        </Group>

        <Group grow>
          <Tooltip label="Your pre-adventuring history — gives extra proficiencies and role-playing flavor." color="dark" withArrow multiline maw={260}>
            <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Background" value={characterForm.background} onChange={(e) => setCharacterForm({ background: e.currentTarget.value })}  />
          </Tooltip>

          <Tooltip label="Shows your moral and ethical stance — affects behavior and certain spells or factions." color="dark" withArrow multiline maw={260}>
            <Select classNames={{ input: "glassy-input", label: "glassy-label" }} label="Alignment" placeholder="Select alignment" data={["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil"]} value={characterForm.alignment} onChange={(v) => setCharacterForm({ alignment: v || "" })}  />
          </Tooltip>
        </Group>

        <Group grow>
          <Tooltip label="Represents your character’s overall power and progression. Max: 20." color="dark" withArrow multiline maw={240}>
            <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Level" min={1} max={20} value={characterForm.level} onChange={(v) => setCharacterForm({ level: typeof v === "number" ? v : v ? Number(v) : 0 })}  />
          </Tooltip>

          <Tooltip label="Your general skill bonus for actions you’re proficient in. Usually +2 at level 1, increasing every few levels." color="dark" withArrow multiline maw={260}>
            <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Proficiency Bonus" value={characterForm.proficiencyBonus} onChange={(v) => setCharacterForm({ proficiencyBonus: typeof v === "number" ? v : v ? Number(v) : 0 })}  />
          </Tooltip>

          <Tooltip label="Inspiration grants advantage on a roll when spent — typically awarded for great roleplay or creativity." color="dark" withArrow multiline maw={260}>
            <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Inspiration" value={characterForm.inspiration} onChange={(v) => setCharacterForm({ inspiration: typeof v === "number" ? v : v ? Number(v) : 0 })}  />
          </Tooltip>
        </Group>
      </Stack>
    </ExpandableSection>
  );
}
