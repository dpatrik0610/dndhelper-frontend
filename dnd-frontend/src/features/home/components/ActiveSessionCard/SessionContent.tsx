import { Divider, Paper, Skeleton, Stack, Text, ThemeIcon, Group, ActionIcon } from "@mantine/core";
import { IconNotebook, IconAlertCircle, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import type { Note } from "@appTypes/Note";
import { useState } from "react";

interface Props {
  notes: Note[];
  loading: boolean;
  error: string | null;
  palette: { cardBg: string; border: string; textMain: string; textDim: string };
  panelBg: string;
}

export function SessionContent({ notes, loading, error, palette, panelBg }: Props) {
  const hasNotes = notes.length > 0;
  const [expanded, setExpanded] = useState(true);

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        background: panelBg,
        borderColor: palette.border,
      }}
    >
      <Stack gap="sm">
        <Group align="center" gap="xs" justify="space-between">
          <Group gap="xs" align="center">
            <ThemeIcon size={26} radius="md" variant="light" color="violet">
              <IconNotebook size={16} />
            </ThemeIcon>
            <Text fw={700} c={palette.textMain}>
              Notes
            </Text>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={expanded ? "Collapse notes" : "Expand notes"}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        </Group>

        {(loading || error || hasNotes)}

        {expanded && (loading ? (
          <Stack gap="xs">
            <Skeleton height={12} radius="xl" />
            <Skeleton height={12} radius="xl" />
            <Skeleton height={12} radius="xl" />
          </Stack>
        ) : error ? (
          <Group gap="xs" align="center">
            <ThemeIcon color="orange" size={22} radius="xl" variant="light">
              <IconAlertCircle size={14} />
            </ThemeIcon>
            <Text size="sm" c="orange.4">
              {error}
            </Text>
          </Group>
        ) : hasNotes ? (
          <Stack gap="sm">
            {notes.map((note, idx) => (
              <div key={note.id ?? note.title ?? `note-${idx}`}>
                {idx > 0 && <Divider color={palette.border} my="xs" />}
                <Text fw={700} size="sm" c={palette.textMain} style={{ marginBottom: 4 }}>
                  {note.title ?? "Untitled"}
                </Text>
                <Text size="sm" c={palette.textDim} style={{ whiteSpace: "pre-wrap" }}>
                  {(note.lines ?? []).join("\n") || "No content"}
                </Text>
              </div>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c={palette.textDim}>
            No linked notes yet.
          </Text>
        ))}
      </Stack>
    </Paper>
  );
}
