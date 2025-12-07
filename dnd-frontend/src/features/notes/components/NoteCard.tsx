import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import {
  IconDownload,
  IconPencil,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import type { Note } from "@appTypes/Note";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { magicGlowTheme } from "@styles/magic/glowTheme";

interface NoteCardProps {
  note: Note;
  searchQuery?: string;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isMobile?: boolean;
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
  isMobile,
}: NoteCardProps) {
  const markdownContent = (note.lines ?? []).join("\n");
  const title = note.title ?? "Untitled";
  const titleContent = (
    <Text fw={600} c={magicGlowTheme.text.color} size="sm" style={{ lineHeight: 1.05 }}>
      {highlightText(title, searchQuery)}
    </Text>
  );
  const actionSize = isMobile ? "lg" : "md";

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
      color={SectionColor.Blue}
      defaultOpen
      transparent
      padding={14}
      marginTop={2}
      marginBottom={2}
      style={{
        ...magicGlowTheme.card,
        background: "rgba(30, 26, 60, 0.72)",
      }}
    >
        <Group justify="space-between" mb={8} align="center" gap="xs">
          <Text c="dimmed" size="xs">
            Updated:{" "}
            {note.updatedAt
              ? new Date(note.updatedAt).toLocaleString("en-GB").replace(/\//g, ".")
              : "n/a"}
          </Text>
          <Group gap={6} wrap="nowrap">
          <Tooltip label={note.isFavorite ? "Unfavorite" : "Favorite"}>
            <ActionIcon size={actionSize} variant="light" color="yellow" radius="md" onClick={onToggleFavorite}>
              {note.isFavorite ? (
                <IconStarFilled size={16} color="gold" />
              ) : (
                <IconStar size={16} />
              )}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Edit note">
            <ActionIcon size={actionSize} variant="light" color="grape" radius="md" onClick={onEdit}>
              <IconPencil size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Download markdown">
            <ActionIcon size={actionSize} variant="light" color="blue" radius="md" onClick={handleDownload}>
              <IconDownload size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete">
            <ActionIcon
              size={actionSize}
              variant="light"
              color="red"
              radius="md"
              onClick={onDelete}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
          </Group>
        </Group>

        <MarkdownRenderer content={markdownContent} highlightQuery={searchQuery} />
    </ExpandableSection>
  );
}
