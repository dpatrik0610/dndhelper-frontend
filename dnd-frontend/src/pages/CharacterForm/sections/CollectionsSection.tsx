import { Stack } from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { IconBook2 } from "@tabler/icons-react";
import { ListEditor } from "../components/ListEditor";
import type { UseFormReturnType } from "@mantine/form";

interface CollectionsProps {
  form: UseFormReturnType<any>;
}

export function CollectionsSection({ form }: CollectionsProps) {
  return (
    <ExpandableSection title="Collections" icon={<IconBook2 />} color={SectionColor.Blue}>
      <Stack>
        <ListEditor form={form} label="Languages" field="languages" placeholder="Add language..." />
        <ListEditor form={form} label="Proficiencies" field="proficiencies" placeholder="Add proficiency..." />
        <ListEditor form={form} label="Features" field="features" placeholder="Add feature..." />
        <ListEditor form={form} label="Spells" field="spells" placeholder="Add spell..." />
      </Stack>
    </ExpandableSection>
  );
}
