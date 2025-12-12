import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Paper,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconDeviceFloppy, IconRefresh, IconSparkles, IconX } from "@tabler/icons-react";
import type { Note } from "@appTypes/Note";
import { useNoteStore } from "@store/useNoteStore";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";
import { magicGlowTheme } from "@styles/magic/glowTheme";
import { NoteModalShell } from "./NoteModalShell";

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(note?.title ?? "");
    setLines((note?.lines ?? []).join("\n"));
  }, [note]);

  const stats = useMemo(() => {
    const normalized = lines.trim();
    const words = normalized ? normalized.split(/\s+/).length : 0;
    const headers = (lines.match(/^#/gm) ?? []).length;
    const lineCount = lines.length > 0 ? lines.split("\n").length : 0;

    return { words, headers, lineCount };
  }, [lines]);

  const existingTags = useMemo(() => {
    const source = `${title} ${lines}`;
    const matches = source.match(/#[a-zA-Z0-9_-]+/g) ?? [];
    return Array.from(new Set(matches.map((tag) => tag.slice(1).toLowerCase())));
  }, [title, lines]);

  const updatedLabel = note?.updatedAt
    ? new Date(note.updatedAt).toLocaleString()
    : "Not updated yet";

  async function handleSave() {
    if (!note || !note.id) return;

    setSaving(true);

    try {
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
    } catch (error) {
      console.error("Failed to update note", error);
      showNotification({
        title: "Could not update note",
        message: "Please try again.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  }

  const resetContent = () => {
    setTitle(note?.title ?? "");
    setLines((note?.lines ?? []).join("\n"));
  };

  return (
    <NoteModalShell
      opened={opened}
      onClose={onClose}
      isMobile={isMobile}
      saving={saving}
      size={isMobile ? "100%" : "lg"}
    >
      <Paper
        withBorder
        radius="md"
        p="md"
        style={{
          ...magicGlowTheme.card,
          background: "rgba(30,26,60,0.6)",
          borderColor: "rgba(180,150,255,0.5)",
        }}
      >
        <Group gap={6} align="center">
          <ThemeIcon size="sm" variant="light" color="cyan">
            <IconSparkles size={14} />
          </ThemeIcon>

          <Text size="md" fw={700}>
            Note details
          </Text>
        </Group>
        <Group gap={6} align="center">
          <ThemeIcon size="sm" variant="light" color="cyan">
            <IconRefresh size={14} />
          </ThemeIcon>
          <Text size="md" fw={700}>
            Last updated: 
          </Text>
          <Badge variant="gradient" color="black" gradient={{ from: "indigo", to: "cyan" }}>
            {updatedLabel}
          </Badge>
        </Group>
      </Paper>

      <TextInput
        classNames={{ input: "glassy-input", label: "glassy-label" }}
        label="Title"
        placeholder="Update the title"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />

      <MarkdownTextarea
        label="Details"
        value={lines}
        onChange={setLines}
        minHeightRem={isMobile ? 20 : 16}
      />
      <Text size="xs" c="rgba(229,219,255,0.7)">
        {stats.words} words / {stats.lineCount} lines / {stats.headers} headers
      </Text>

      <Group gap="xs" wrap="wrap">
        {existingTags.length > 0 ? (
          existingTags.map((tag) => (
            <Badge key={tag} variant="outline" color="grape">
              #{tag}
            </Badge>
          ))
        ) : (
          <Badge variant="light" color="gray">
            No tags detected
          </Badge>
        )}
      </Group>

      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Text size="xs" c="rgba(229,219,255,0.7)">
          Tip: use <Text span fw={600}>#tags</Text> to help future searches.
        </Text>

        <Group gap="xs" w={isMobile ? "100%" : "auto"}>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={14} />}
            onClick={resetContent}
            fullWidth={isMobile}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            variant="light"
            color="red"
            leftSection={<IconX size={14} />}
            fullWidth={isMobile}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: "#c084fc", to: "#60a5fa" }}
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={() => void handleSave()}
            fullWidth={isMobile}
            loading={saving}
          >
            Save changes
          </Button>
        </Group>
      </Group>
    </NoteModalShell>
  );
}
