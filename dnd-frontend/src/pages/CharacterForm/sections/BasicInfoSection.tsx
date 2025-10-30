import { Group, NumberInput, Select, Stack, TextInput, Tooltip } from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import type { UseFormReturnType } from "@mantine/form";
import { IconUser } from "@tabler/icons-react";

interface BasicInfoProps {
  form: UseFormReturnType<any>;
}

export function BasicInfoSection({ form }: BasicInfoProps) {
  return (
    <ExpandableSection
      title="Basic Information"
      icon={<IconUser />}
      color={SectionColor.White}
      defaultOpen
    >
      <Stack>
        <TextInput
          label="Name"
          required
          {...form.getInputProps("name")}
        />

        <Group grow>
          <Tooltip
            label="A character’s species — affects abilities, features, and traits (e.g., Elf, Human, Dragonborn)."
            color="dark"
            withArrow
            multiline
            maw={260}
          >
            <TextInput label="Race" {...form.getInputProps("race")} />
          </Tooltip>

          <Tooltip
            label="Defines your role, abilities, and spellcasting — e.g., Fighter, Rogue, Wizard."
            color="dark"
            withArrow
            multiline
            maw={260}
          >
            <TextInput label="Class" {...form.getInputProps("characterClass")} />
          </Tooltip>
        </Group>

        <Group grow>
          <Tooltip
            label="Your pre-adventuring history — gives extra proficiencies and role-playing flavor."
            color="dark"
            withArrow
            multiline
            maw={260}
          >
            <TextInput label="Background" {...form.getInputProps("background")} />
          </Tooltip>

          <Tooltip
            label="Shows your moral and ethical stance — affects behavior and certain spells or factions."
            color="dark"
            withArrow
            multiline
            maw={260}
          >
            <Select
              label="Alignment"
              placeholder="Select alignment"
              data={[
                "Lawful Good", "Neutral Good", "Chaotic Good",
                "Lawful Neutral", "True Neutral", "Chaotic Neutral",
                "Lawful Evil", "Neutral Evil", "Chaotic Evil",
              ]}
              {...form.getInputProps("alignment")}
            />
          </Tooltip>
        </Group>

        <Group grow>
          <Tooltip
            label="Represents your character’s overall power and progression. Max: 20."
            color="dark"
            withArrow
            multiline
            maw={240}
          >
            <NumberInput
              label="Level"
              min={1}
              max={20}
              {...form.getInputProps("level")}
            />
          </Tooltip>

          <Tooltip
            label="Your general skill bonus for actions you’re proficient in. Usually +2 at level 1, increasing every few levels."
            color="dark"
            withArrow
            multiline
            maw={260}
          >
            <NumberInput
              label="Proficiency Bonus"
              {...form.getInputProps("proficiencyBonus")}
            />
          </Tooltip>

          <Tooltip
            label="Inspiration grants advantage on a roll when spent — typically awarded for great roleplay or creativity."
            color="dark"
            withArrow
            multiline
            maw={260}
          >
            <NumberInput
              label="Inspiration"
              {...form.getInputProps("inspiration")}
            />
          </Tooltip>
        </Group>
      </Stack>
    </ExpandableSection>
  );
}
