import { useState } from "react";
import { Button, Stack, TextInput, Group, Text, Paper } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterStore } from "@store/useCharacterStore";
import { useAuthStore } from "@store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { deleteCharacter } from "@services/characterService";
import { loadCharacters } from "@utils/loadCharacter";
import { showNotification } from "@components/Notification/Notification";

export function DeleteCharacterSection() {
  const { character, clearStore } = useCharacterStore();
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!character?.id) return null;

  const handleDelete = async () => {
    if (confirmText.trim() !== character.name) {
      showNotification({
        title: "Confirmation Failed",
        message: `Please type "${character.name}" exactly to confirm.`,
        color: "yellow",
      });
      return;
    }

    setLoading(true);
    try {
      await deleteCharacter(character.id!, token ?? "");
      clearStore();

      showNotification({
        title: "Character Deleted",
        message: `${character.name} has been permanently removed.`,
        color: "red",
        icon: <IconTrash />,
      });

      await loadCharacters(token ?? "");
      navigate("/home");
    } catch (err) {
      console.error("❌ Delete failed:", err);
      showNotification({
        title: "Error",
        message: "Failed to delete character.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpandableSection title="Delete Character" icon={<IconTrash />} color={SectionColor.Red}>
      <Paper p="md" radius="md" style={{ background: "rgba(255,0,0,0.05)", border: "1px solid rgba(255,0,0,0.2)" }}>
        <Stack gap="xs">
          <Text size="sm" c="red.4" fw={500}>⚠️ This action is irreversible!</Text>
          <Text size="sm" c="dimmed">To confirm, type your character’s name below:</Text>

          <TextInput
            placeholder={`Type "${character.name}" to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
            styles={{ input: { backgroundColor: "rgba(255,255,255,0.05)" } }}
          />

          <Group justify="flex-end" mt="sm">
            <Button
              color="red"
              variant="gradient"
              gradient={{ from: "red", to: "orange" }}
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
              loading={loading}
              disabled={confirmText.trim() !== character.name}
            >
              Delete Character
            </Button>
          </Group>
        </Stack>
      </Paper>
    </ExpandableSection>
  );
}
