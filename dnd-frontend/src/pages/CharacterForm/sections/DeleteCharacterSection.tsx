import { useState } from "react";
import {
  Button,
  Stack,
  TextInput,
  Group,
  Text,
  Paper,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

// 🔥 You'll need this backend call:
import { deleteCharacter } from "../../../services/characterService";
import { loadCharacters } from "../../../utils/loadCharacter";

export function DeleteCharacterSection() {
  const { character, clearCharacter } = useCharacterStore();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!character) return null;

  async function handleDelete() {
    if (!character?.id) return;

    if (confirmText.trim() !== character.name) {
      notifications.show({
        title: "Confirmation Failed",
        message: `Type "${character.name}" exactly to confirm deletion.`,
        color: "yellow",
      });
      return;
    }

    setLoading(true);
    try {
      await deleteCharacter(character.id, token!);
      clearCharacter();

      notifications.show({
        title: "Character Deleted",
        message: `${character.name} has been permanently removed.`,
        color: "red",
        icon: <IconTrash />,
      });

      navigate("/home");
    } catch (err) {
      console.error("Delete failed:", err);
      notifications.show({
        title: "Error",
        message: "Failed to delete character.",
        color: "red",
      });
    } finally {
      setLoading(false);
      loadCharacters(useAuthStore.getState().token!)
    }
  }

  return (
    <ExpandableSection
      title="Delete Character"
      icon={<IconTrash />}
      color={SectionColor.Red}
    >
      <Paper
        p="md"
        radius="md"
        style={{
          background: "rgba(255,0,0,0.05)",
          border: "1px solid rgba(255,0,0,0.2)",
        }}
      >
        <Stack gap="xs">
          <Text size="sm" c="red.4" fw={500}>
            ⚠️ This action is irreversible!
          </Text>

          <Text size="sm" c="dimmed">
            To confirm, type your character’s name below:
          </Text>

          <TextInput
            placeholder={`Type "${character.name}" to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
            styles={{
              input: { backgroundColor: "rgba(255,255,255,0.05)" },
            }}
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
