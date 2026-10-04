import { useState } from "react";
import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterList, useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { deleteCharacter } from "@services/characterService";
import type { Character } from "@appTypes/Character/Character";
import { SettingsSection } from "@features/settings/SettingsSection";

/** Permanent deletion, confirmed by typing the name. Mount with key={character.id} so the confirmation resets. */
export function DangerZone({ character }: { character: Character }) {
  const characters = useCharacterList();
  const current = useCurrentCharacter();
  const { setCharacters, setCharacter } = useCharacterCoreActions();

  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmed = confirmText.trim() === character.name;

  const handleDelete = async () => {
    if (!character.id || !confirmed) return;
    setLoading(true);
    try {
      await deleteCharacter(character.id);
      setCharacters(characters.filter((c) => c.id !== character.id));
      if (current?.id === character.id) setCharacter(null);

      showNotification({
        title: "Character Deleted",
        message: `${character.name} has been permanently removed.`,
        color: SectionColor.Red,
        icon: <IconTrash />,
      });
    } catch (err) {
      console.error("Delete failed:", err);
      showNotification({
        title: "Error",
        message: "Failed to delete character.",
        color: SectionColor.Red,
      });
      setLoading(false);
    }
  };

  return (
    <SettingsSection
      danger
      icon={<IconAlertTriangle size={20} color="#f87171" />}
      title="Danger zone"
      description="Deleting a character removes it and everything attached to it for good. This cannot be undone."
    >
      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          Type <b style={{ color: "var(--theme-color-text-primary, #fff)" }}>{character.name}</b> to confirm.
        </Text>
        <Group gap="xs" wrap="nowrap" align="center">
          <TextInput
            placeholder={character.name}
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
            aria-label={`Type ${character.name} to confirm deletion`}
            style={{ flex: 1, minWidth: 0 }}
            styles={{ input: { backgroundColor: "rgba(255,255,255,0.05)" } }}
          />
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={handleDelete}
            loading={loading}
            disabled={!confirmed}
            style={{ flexShrink: 0 }}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </SettingsSection>
  );
}
