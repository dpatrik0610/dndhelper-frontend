// components/AddNoteModal.tsx
import { useState } from "react";
import { TextInput, Textarea, Stack } from "@mantine/core";
import { BaseModal } from "../../../components/BaseModal";
import { createNote } from "../../../services/noteService";
import { useAuthStore } from "../../../store/useAuthStore";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { showNotification } from "../../../components/Notification/Notification";
import "../../../styles/glassyInput.css";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function AddNoteModal({ opened, onClose }: Props) {
  const token = useAuthStore.getState().token!;
  const { character, setCharacter } = useCharacterStore();

  const [title, setTitle] = useState("");
  const [lines, setLines] = useState("");

  async function handleSave() {
    if (!character) return;

    const newNote = await createNote(
      { title, lines: lines.split("\n") },
      token
    );

    // attach note to character
    const updated = {
      ...character,
      noteIds: [...(character.noteIds ?? []), newNote.id!],
    };

    setCharacter(updated);

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
          classNames={{ input: "glassy-input" , label: "glassy-label" }}
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />

        <Textarea
          classNames={{ input: "glassy-input" , label: "glassy-label" }}
          label="Lines"
          minRows={4}
          value={lines}
          onChange={(e) => setLines(e.currentTarget.value)}
        />
      </Stack>
    </BaseModal>
  );
}
