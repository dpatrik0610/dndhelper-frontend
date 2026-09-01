import { Group, Switch } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { IconLock } from "@tabler/icons-react";
import { useCharacterFormStore } from "@store/character/characterFormStore";

export function AdminSection({ noBox = false }: { noBox?: boolean }) {
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  const content = (
    <Group grow gap="xl">
      <Switch
        label="Is Dead"
        checked={characterForm.isDead}
        onChange={(e) => setCharacterForm({ isDead: e.currentTarget.checked })}
        classNames={{
          root: "sq-switch",
          track: "sq-switch-track",
          thumb: "sq-switch-thumb",
        }}
        styles={{ label: { color: "#fff", fontSize: "13px" } }}
      />
      <Switch
        label="Is NPC"
        checked={characterForm.isNPC}
        onChange={(e) => setCharacterForm({ isNPC: e.currentTarget.checked })}
        classNames={{
          root: "sq-switch",
          track: "sq-switch-track",
          thumb: "sq-switch-thumb",
        }}
        styles={{ label: { color: "#fff", fontSize: "13px" } }}
      />
    </Group>
  );

  if (noBox) return content;

  return (
    <ExpandableSection title="Admin Options" icon={<IconLock />} color={SectionColor.Orange} defaultOpen>
      {content}
    </ExpandableSection>
  );
}
