import { ActionIcon, Group, Paper, Text } from "@mantine/core";
import { IconPencil, IconStar, IconStarFilled, IconTrash } from "@tabler/icons-react";
import { MarkdownRenderer } from "../../../../components/MarkdownRender";
import type { Note } from "../../../../types/Note";

interface NoteCardProps {
  note: Note;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onToggleFavorite, onEdit, onDelete }: NoteCardProps) {
  const markdownContent = (note.lines ?? []).join("\n");

  return (
    <Paper
      withBorder
      p="sm"
      style={{
        background: "rgba(50, 0, 0, 0.25)",
        border: "1px solid rgba(255,80,80,0.25)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Group justify="space-between" mb={6}>
        <Text fw={500} c="red.2">
          {note.title ?? "Untitled"}
        </Text>

        <Group gap={4}>
          <ActionIcon size="sm" variant="subtle" onClick={onToggleFavorite}>
            {note.isFavorite ? (
              <IconStarFilled size={14} color="yellow" />
            ) : (
              <IconStar size={14} />
            )}
          </ActionIcon>

          <ActionIcon size="sm" variant="subtle" onClick={onEdit}>
            <IconPencil size={12} />
          </ActionIcon>

          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={onDelete}
          >
            <IconTrash size={12} />
          </ActionIcon>
        </Group>
      </Group>

      <MarkdownRenderer content={markdownContent} />

      <Text c="dimmed" size="xs" mt={4}>
        Updated at:{" "}
        {note.updatedAt
          ? new Date(note.updatedAt)
              .toLocaleString("en-GB", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(/\//g, ".")
          : "n/a"}
      </Text>
    </Paper>
  );
}