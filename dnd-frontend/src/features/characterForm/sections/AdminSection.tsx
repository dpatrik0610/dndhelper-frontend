import { Group, Switch } from "@mantine/core";
import { useCharacterFormStore } from "@store/character/characterFormStore";

export function AdminSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  return (
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
}
