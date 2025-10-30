import { Group, NumberInput, Stack } from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { IconSword } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";

interface CombatStatsProps {
  form: UseFormReturnType<any>;
}

export function CombatStatsSection({ form }: CombatStatsProps) {
  return (
    <ExpandableSection title="Combat Statistics" icon={<IconSword />} color={SectionColor.Red}>
      <Stack>
        <Group grow>
          <NumberInput label="Armor Class" {...form.getInputProps("armorClass")} />
          <NumberInput label="Speed (ft)" {...form.getInputProps("speed")} />
        </Group>

        <Group grow>
          <NumberInput label="HP" max={form.values.maxHitPoints} {...form.getInputProps("hitPoints")} />
          <NumberInput label="Max HP" {...form.getInputProps("maxHitPoints")} />
          <NumberInput label="Temp HP" {...form.getInputProps("temporaryHitPoints")} />
        </Group>

        <Group grow>
          <NumberInput label="Initiative" {...form.getInputProps("initiative")} />
          <NumberInput label="Experience" {...form.getInputProps("experience")} />
        </Group>
      </Stack>
    </ExpandableSection>
  );
}
