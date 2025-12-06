import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import {
  IconDownload,
  IconPencil,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import type { Note } from "../../../types/Note";
import { MarkdownRenderer } from "../../../components/MarkdownRender";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { SectionColor } from "../../../types/SectionColor";

interface NoteCardProps {
  note: Note;
  searchQuery?: string;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const highlightText = (value: string, query?: string) => {
  if (!query) return value;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const lower = query.toLowerCase();

  return value.split(regex).map((part, index) => {
    const isMatch = part.toLowerCase() === lower;

    return isMatch ? (
      <Text
        key={`${part}-${index}`}
        span
        style={{
          background: "rgba(255, 230, 230, 0.35)",
          color: "white",
          padding: "0 2px",
          borderRadius: 3,
        }}
      >
        {part}
      </Text>
    ) : (
      <Text key={`${part}-${index}`} span>
        {part}
      </Text>
    );
  });
};

const safeFileName = (raw: string) =>
  raw
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-") || "note";

export function NoteCard({
  note,
  searchQuery,
  onToggleFavorite,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const markdownContent = (note.lines ?? []).join("\n");
  const title = note.title ?? "Untitled";
  const titleContent = (
    <Text fw={600} c="red.3" size="sm" style={{ lineHeight: 1.05 }}>
      {highlightText(title, searchQuery)}
    </Text>
  );

  const handleDownload = () => {
    const blob = new Blob([`# ${title}\n\n${markdownContent}`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFileName(title)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ExpandableSection
      title={title}
      titleContent={titleContent}
      color={SectionColor.Red}
      defaultOpen
      transparent
      padding={8}
      marginTop={4}
      marginBottom={4}
      style={{
        background: "rgba(50, 0, 0, 0.2)",
        border: "1px solid rgba(255,80,80,0.25)",
      }}
    >
      
        <Group justify="flex-end" mb={6} gap={4}>
          <Tooltip label={note.isFavorite ? "Unfavorite" : "Favorite"}>
            <ActionIcon size="sm" variant="subtle" onClick={onToggleFavorite}>
              {note.isFavorite ? (
                <IconStarFilled size={14} color="yellow" />
              ) : (
                <IconStar size={14} />
              )}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Edit note">
            <ActionIcon size="sm" variant="subtle" onClick={onEdit}>
              <IconPencil size={12} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Download markdown">
            <ActionIcon size="sm" variant="subtle" onClick={handleDownload}>
              <IconDownload size={12} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={onDelete}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <MarkdownRenderer content={markdownContent} highlightQuery={searchQuery} />

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
    </ExpandableSection>
  );
}
