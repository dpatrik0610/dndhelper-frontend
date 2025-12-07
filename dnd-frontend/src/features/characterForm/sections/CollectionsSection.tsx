import { Stack } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { IconBook2 } from "@tabler/icons-react";
import { ListEditor } from "../components/ListEditor";
import { useCharacterFormStore } from "@store/useCharacterFormStore";

export function CollectionsSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  const formAdapter = {
    values: characterForm,
    setFieldValue: (field: string, value: unknown) => setCharacterForm({ [field]: value }),
  };

  return (
    <ExpandableSection title="Collections" icon={<IconBook2 />} color={SectionColor.Blue} defaultOpen>
    <Stack>
      <ListEditor form={formAdapter} field="languages" label="Languages" placeholder="Add language..." />
      <ListEditor form={formAdapter} field="proficiencies" label="Proficiencies" placeholder="Add proficiency..." />
      <ListEditor form={formAdapter} field="features" label="Features" placeholder="Add feature..." type="feature" />
    </Stack>
    </ExpandableSection>
  );
}
