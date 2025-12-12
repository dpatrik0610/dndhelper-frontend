import { useMemo, useState } from "react";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconDeviceFloppy,
  IconHash,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { useCharacterStore } from "@store/useCharacterStore";
import { useNoteStore } from "@store/useNoteStore";
import { showNotification } from "@components/Notification/Notification";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import { magicGlowTheme } from "@styles/magic/glowTheme";
import CustomBadge from "@components/common/CustomBadge";
import { NoteModalShell } from "@features/notes/components/NoteModalShell";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function AddNoteModal({ opened, onClose }: Props) {
  const character = useCharacterStore((s) => s.character);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const createNote = useNoteStore((s) => s.create);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [title, setTitle] = useState("");
  const [lines, setLines] = useState("");
  const [saving, setSaving] = useState(false);

  const quickSnippets = [
    {
      label: "Session recap",
      content: "## Session recap\n- Key events:\n- NPCs met:\n- Hooks for next time:\n",
    },
    {
      label: "NPC / Faction",
      content: "### NPC / Faction\n- Name:\n- Where we met:\n- Motive:\n- Favor owed?:\n",
    },
    {
      label: "Clue / Puzzle",
      content: "### Clue\n- Found at:\n- Why it matters:\n- Next guess:\n",
    },
  ];

  const quickTags = ["#quest", "#npc", "#loot", "#idea", "#clue", "#session"];

  const stats = useMemo(() => {
    const normalized = lines.trim();
    const words = normalized ? normalized.split(/\s+/).length : 0;
    const headers = (lines.match(/^#/gm) ?? []).length;
    const lineCount = lines.length > 0 ? lines.split("\n").length : 0;

    return { words, headers, lineCount };
  }, [lines]);

  const addSnippet = (content: string) => {
    setLines((prev) => {
      const needsLineBreak = prev.length > 0 && !prev.endsWith("\n\n");
      const prefix = needsLineBreak ? "\n\n" : "";
      return `${prev}${prefix}${content}`;
    });
  };

  const addTag = (tag: string) => {
    setLines((prev) => {
      const separator = prev.endsWith(" ") || prev.endsWith("\n") || prev.length === 0 ? "" : " ";
      return `${prev}${separator}${tag} `;
    });
  };

  async function handleSave() {
    if (!character) return;

    if (!title.trim() && !lines.trim()) {
      showNotification({
        title: "Add something first",
        message: "Give your note a title or some text before saving.",
        color: "yellow",
      });
      return;
    }

    setSaving(true);

    try {
      const newNote = await createNote({
        title: title.trim() || "Untitled note",
        lines: lines.split("\n"),
      });

      const currentIds = character.noteIds ?? [];
      updateCharacter({
        noteIds: [...currentIds, newNote.id!],
      });

      showNotification({
        title: "Success",
        message: "Note added.",
      });

      onClose();
      setTitle("");
      setLines("");
    } catch (error) {
      console.error("Failed to create note", error);
      showNotification({
        title: "Could not create note",
        message: "Something went wrong while saving. Please try again.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  }

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
        <Group justify="space-between" align="flex-start" gap="sm">
          <Stack gap={4}>
            <Group gap={6}>
              <ThemeIcon size="sm" variant="light" color="cyan">
                <IconSparkles size={14} />
              </ThemeIcon>
              <Text fw={600} size="sm">
                Quick buttons
              </Text>
            </Group>
            <Text size="xs" c="rgba(229,219,255,0.75)">
              Tap to drop a scaffold before writing.
            </Text>
          </Stack>
        </Group>

        <Group gap="xs" mt="sm" wrap="wrap">
          {quickSnippets.map((snippet) => (
            <Button
              key={snippet.label}
              variant="light"
              color="grape"
              size="xs"
              radius="md"
              onClick={() => addSnippet(snippet.content)}
            >
              {snippet.label}
            </Button>
          ))}
        </Group>
      </Paper>

      <TextInput
        classNames={{ input: "glassy-input", label: "glassy-label" }}
        label="Title"
        placeholder="e.g. Raven Queen temple - final chamber"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />

      <MarkdownTextarea
        label="Details"
        value={lines}
        onChange={setLines}
        minHeightRem={isMobile ? 18 : 14}
      />
      <Text size="xs" c="rgba(229,219,255,0.7)">
        {stats.words} words / {stats.lineCount} lines / {stats.headers} headers
      </Text>

      <Group gap="xs" wrap="wrap">
        {quickTags.map((tag) => (
          <Tooltip key={tag} label="Append tag" withArrow>
            <CustomBadge
              variant="light"
              color="indigo"
              onClick={() => addTag(tag)}
              icon={<IconHash />}
              label={tag.replace("#", "")}
              size="xs"
            />
          </Tooltip>
        ))}
      </Group>

      <Group justify="space-between" align="center" wrap="wrap" gap="sm" mt="xs">
        <Text size="xs" c="rgba(229,219,255,0.7)">
          Tip: use <Text span fw={600}>#tags</Text> to make filtering easier later.
        </Text>

        <Group gap="xs" w={isMobile ? "100%" : "auto"}>
          <Button
            variant="subtle"
            color="gray"
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
            Create note
          </Button>
        </Group>
      </Group>
    </NoteModalShell>
  );
}
