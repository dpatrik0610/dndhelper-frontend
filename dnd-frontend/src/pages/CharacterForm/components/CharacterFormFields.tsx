import {
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import { type UseFormReturnType } from "@mantine/form";

interface CharacterFormFieldsProps {
  form: UseFormReturnType<any>;
  isAdmin: boolean;
}

export function CharacterFormFields({ form, isAdmin }: CharacterFormFieldsProps) {
  return (
    <Stack>
      <TextInput label="Name" required {...form.getInputProps("name")} />

      <Group grow>
        <TextInput label="Race" {...form.getInputProps("race")} />
        <TextInput label="Class" {...form.getInputProps("characterClass")} />
      </Group>

      <Group grow>
        <TextInput label="Background" {...form.getInputProps("background")} />
        <Select
          label="Alignment"
          data={[
            "Lawful Good", "Neutral Good", "Chaotic Good",
            "Lawful Neutral", "True Neutral", "Chaotic Neutral",
            "Lawful Evil", "Neutral Evil", "Chaotic Evil",
          ]}
          {...form.getInputProps("alignment")}
        />
      </Group>

      <Group grow>
        <NumberInput label="Level" min={1} max={20} {...form.getInputProps("level")} />
        <NumberInput label="Proficiency Bonus" {...form.getInputProps("proficiencyBonus")} />
      </Group>

      <Group grow>
        <NumberInput label="Armor Class" {...form.getInputProps("armorClass")} />
        <NumberInput label="Speed (ft)" {...form.getInputProps("speed")} />
      </Group>

      <Group grow>
        <NumberInput label="HP" {...form.getInputProps("hitPoints")} max={form.getInputProps("maxHitPoints").value}/>
        <NumberInput label="Max HP" {...form.getInputProps("maxHitPoints")} />
        <NumberInput label="Temp HP" {...form.getInputProps("temporaryHitPoints")} />
      </Group>

      <Group grow>
        <NumberInput label="Initiative" {...form.getInputProps("initiative")} />
        <NumberInput label="Experience" {...form.getInputProps("experience")} />
      </Group>

      {isAdmin && (
        <Group grow>
          <Switch label="Is Dead" {...form.getInputProps("isDead", { type: "checkbox" })} />
          <Switch label="Is NPC" {...form.getInputProps("isNPC", { type: "checkbox" })} />
        </Group>
      )}

      <Textarea
        label="Description / Notes"
        minRows={3}
        autosize
        {...form.getInputProps("description")}
      />
    </Stack>
  );
}
