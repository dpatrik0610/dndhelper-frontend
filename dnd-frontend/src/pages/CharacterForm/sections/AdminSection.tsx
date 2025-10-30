import { Group, Switch } from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { IconLock } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";

interface AdminProps {
  form: UseFormReturnType<any>;
}

export function AdminSection({ form }: AdminProps) {
  return (
    <ExpandableSection title="Admin Options" icon={<IconLock />} color={SectionColor.Orange}>
      <Group grow>
        <Switch label="Is Dead" {...form.getInputProps("isDead", { type: "checkbox" })} />
        <Switch label="Is NPC" {...form.getInputProps("isNPC", { type: "checkbox" })} />
      </Group>
    </ExpandableSection>
  );
}
