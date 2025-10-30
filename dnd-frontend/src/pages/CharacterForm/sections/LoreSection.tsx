import { Stack, Textarea, Group, NumberInput, TextInput } from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { IconBook } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";

interface LoreSectionProps {
  form: UseFormReturnType<any>;
}

export function LoreSection({ form }: LoreSectionProps) {
  return (
    <ExpandableSection title="Lore & Personality" icon={<IconBook />} color={SectionColor.Orange} defaultOpen>
      <Stack>
        <Group grow>
          <NumberInput label="Age" {...form.getInputProps("age")} />
          <TextInput label="Height" {...form.getInputProps("height")} />
          <TextInput label="Weight" {...form.getInputProps("weight")} />
        </Group>

        <Group grow>
          <TextInput label="Eyes" {...form.getInputProps("eyes")} />
          <TextInput label="Skin" {...form.getInputProps("skin")} />
          <TextInput label="Hair" {...form.getInputProps("hair")} />
        </Group>

        <Textarea label="Appearance" autosize {...form.getInputProps("appearance")} />
        <Textarea label="Personality Traits" autosize {...form.getInputProps("personalityTraits")} />
        <Textarea label="Ideals" autosize {...form.getInputProps("ideals")} />
        <Textarea label="Bonds" autosize {...form.getInputProps("bonds")} />
        <Textarea label="Flaws" autosize {...form.getInputProps("flaws")} />
        <Textarea label="Backstory" autosize {...form.getInputProps("backstory")} />
        <Textarea label="Notes" autosize {...form.getInputProps("notes")} />
      </Stack>
    </ExpandableSection>
  );
}
