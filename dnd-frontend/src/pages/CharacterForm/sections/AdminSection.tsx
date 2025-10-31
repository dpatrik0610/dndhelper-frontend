import { Group, Switch } from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { IconLock } from "@tabler/icons-react";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";

export function AdminSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  return (
    <ExpandableSection title="Admin Options" icon={<IconLock />} color={SectionColor.Orange} defaultOpen>
      <Group grow>
        <Switch
          label="Is Dead"
          checked={characterForm.isDead}
          onChange={(e) => setCharacterForm({ isDead: e.currentTarget.checked })}
        />
        <Switch
          label="Is NPC"
          checked={characterForm.isNPC}
          onChange={(e) => setCharacterForm({ isNPC: e.currentTarget.checked })}
        />
      </Group>
    </ExpandableSection>
  );
}
