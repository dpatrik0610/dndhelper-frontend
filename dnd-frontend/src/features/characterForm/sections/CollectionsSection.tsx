import { Stack } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { IconBook2 } from "@tabler/icons-react";
import { ListEditor } from "@features/characterForm/components/ListEditor";
import { useCharacterFormStore } from "@store/character/characterFormStore";

export function CollectionsSection({ noBox = false }: { noBox?: boolean }) {
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  const formAdapter = {
    values: characterForm,
    setFieldValue: (field: string, value: unknown) => setCharacterForm({ [field]: value }),
  };

  const content = (
    <Stack gap="md">
      <ListEditor form={formAdapter} field="languages" label="Languages" placeholder="Add language..." />
      <ListEditor form={formAdapter} field="proficiencies" label="Proficiencies" placeholder="Add proficiency..." />
    </Stack>
  );

  if (noBox) return content;

  return (
    <ExpandableSection title="Collections" icon={<IconBook2 />} color={SectionColor.Blue} defaultOpen>
      {content}
    </ExpandableSection>
  );
}

