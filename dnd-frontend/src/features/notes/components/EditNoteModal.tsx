import { useEffect, useState } from "react";
import { TextInput, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { Note } from "@appTypes/Note";
import { useNoteStore } from "@store/useNoteStore";
import { showNotification } from "@mantine/notifications";
import { BaseModal } from "@components/BaseModal";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import { SectionColor } from "@appTypes/SectionColor";

interface EditNoteModalProps {
  opened: boolean;
  note: Note | null;
  onClose: () => void;
}

export function EditNoteModal({ opened, note, onClose }: EditNoteModalProps) {
  const updateNote = useNoteStore((s) => s.update);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [title, setTitle] = useState(note?.title ?? "");
  const [lines, setLines] = useState((note?.lines ?? []).join("\n"));

  useEffect(() => {
    setTitle(note?.title ?? "");
    setLines((note?.lines ?? []).join("\n"));
  }, [note]);

  async function handleSave() {
    if (!note || !note.id) return;

    await updateNote(note.id, {
      title,
      lines: lines.split("\n"),
    });

    showNotification({
      id: "NoteUpdated",
      title: "Success",
      message: "Note updated.",
      color: SectionColor.Blue,
      withBorder: true,
      
    });

    onClose();
  }

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Edit Note"
      onSave={handleSave}
      saveLabel="Save"
      fullScreen={isMobile}
      size={isMobile ? "100%" : "lg"}
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
          minHeightRem={isMobile ? 30 : 20}
        />
      </Stack>
    </BaseModal>
  );
}
