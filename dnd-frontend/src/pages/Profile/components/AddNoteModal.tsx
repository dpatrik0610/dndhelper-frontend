import { useState } from "react";
import { TextInput, Stack } from "@mantine/core";
import { BaseModal } from "../../../components/BaseModal";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useNoteStore } from "../../../store/useNoteStore";
import { showNotification } from "../../../components/Notification/Notification";
import { MarkdownTextarea } from "../../../components/common/MarkdownTextarea";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function AddNoteModal({ opened, onClose }: Props) {
  const character = useCharacterStore((s) => s.character);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const persistCharacter = useCharacterStore((s) => s.persistCharacter);
  const createNote = useNoteStore((s) => s.create);

  const [title, setTitle] = useState("");
  const [lines, setLines] = useState("");

  async function handleSave() {
    if (!character) return;

    const newNote = await createNote({
      title,
      lines: lines.split("\n"),
    });

    const currentIds = character.noteIds ?? [];

    // 1) local update
    updateCharacter({
      noteIds: [...currentIds, newNote.id!],
    });

    // 2) persist to API
    await persistCharacter();

    showNotification({
      title: "Success",
      message: "Note added.",
    });

    onClose();
    setTitle("");
    setLines("");
  }

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Add Note"
      onSave={handleSave}
      saveLabel="Create"
    >
      <Stack>
        <TextInput
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />

        <MarkdownTextarea
          label="Details"
          value={lines}
          onChange={setLines}
          minHeightRem={8}
        />
      </Stack>
    </BaseModal>
  );
}
