import { Stack } from "@mantine/core";
import { IconLanguage, IconTool } from "@tabler/icons-react";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { FormGroup } from "@features/characterForm/components/FormGroup";
import { ListEditor } from "@features/characterForm/components/ListEditor";

export function CollectionsSection() {
  const languages = useCharacterFormStore((s) => s.characterForm.languages?.length ?? 0);
  const proficiencies = useCharacterFormStore((s) => s.characterForm.proficiencies?.length ?? 0);

  return (
    <Stack gap="xl">
      <FormGroup icon={<IconLanguage size={16} />} title="Languages" count={languages}>
        <ListEditor field="languages" noun="language" placeholder="e.g. Elvish" />
      </FormGroup>
      <FormGroup icon={<IconTool size={16} />} title="Proficiencies" count={proficiencies}>
        <ListEditor field="proficiencies" noun="proficiency" placeholder="e.g. Thieves' Tools" />
      </FormGroup>
    </Stack>
  );
}

