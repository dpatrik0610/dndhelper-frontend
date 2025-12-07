import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Group, Skeleton, Stack, Text, Paper, Divider } from "@mantine/core";
import dayjs from "dayjs";
import type { Session } from "@appTypes/Session";
import type { Note } from "@appTypes/Note";
import { useNoteStore } from "@store/useNoteStore";
import ReactMarkdown from "react-markdown";

interface Props {
  session: Session;
  palette: { cardBg: string; border: string; textMain: string; textDim: string };
}

export function ActiveSessionCard({ session, palette }: Props) {
  const formatDate = (value?: string | null) => (value ? dayjs(value).format("YYYY-MM-DD") : "Not set");
  const { loadMany } = useNoteStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const noteIds = useMemo(() => (session.noteIds ?? []).filter((n): n is string => Boolean(n)), [session.noteIds]);

  useEffect(() => {
    let mounted = true;
    if (!noteIds.length) {
      setNotes([]);
      setNotesError(null);
      setNotesLoading(false);
      return;
    }
    setNotesLoading(true);
    setNotesError(null);
    loadMany(noteIds)
      .then((fetched) => {
        if (mounted) setNotes(fetched);
      })
      .catch((err) => {
        console.warn("Failed to load session notes", err);
        if (mounted) setNotesError("Failed to load notes");
      })
      .finally(() => {
        if (mounted) setNotesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadMany, noteIds]);

  return (
    <Card
      shadow="md"
      radius="lg"
      withBorder
      p="lg"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderColor: palette.border,
        color: palette.textMain,
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={700} size="lg" c={palette.textMain} style={{ flex: 1, minWidth: 0 }} truncate="end">
            {session.name}
          </Text>
          <Badge color={session.isLive ? "teal" : "gray"} variant="filled" size="lg">
            {session.isLive ? "Active" : "Scheduled"}
          </Badge>
        </Group>

        <Paper withBorder radius="md" p="md" style={{ background: "rgba(0,0,0,0.12)", borderColor: palette.border }}>
          <Text fw={600} size="sm" mb={6}>
            Description
          </Text>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <Text size="sm" c={palette.textDim} style={{ margin: 0 }}>
                  {children}
                </Text>
              ),
              h1: ({ children }) => (
                <Text size="lg" fw={700} c={palette.textMain} style={{ marginBottom: 6 }}>
                  {children}
                </Text>
              ),
              h2: ({ children }) => (
                <Text size="md" fw={700} c={palette.textMain} style={{ marginBottom: 4 }}>
                  {children}
                </Text>
              ),
              h3: ({ children }) => (
                <Text size="sm" fw={700} c={palette.textMain} style={{ marginBottom: 2 }}>
                  {children}
                </Text>
              ),
            }}
          >
            {session.description || "No description"}
          </ReactMarkdown>

          {(notesLoading || notesError || notes.length > 0) && <Divider my="sm" color={palette.border} />}

          {notesLoading ? (
            <Stack gap="xs">
              <Skeleton height={12} radius="xl" />
              <Skeleton height={12} radius="xl" />
            </Stack>
          ) : notesError ? (
            <Text size="sm" c="orange.4">
              {notesError}
            </Text>
          ) : (
            notes.map((note) => (
              <Paper
                key={note.id ?? note.title ?? ""}
                radius="md"
                p="sm"
                style={{ background: "rgba(0,0,0,0.12)", borderColor: palette.border }}
              >
                <Text fw={600} size="sm" c={palette.textMain} style={{ marginBottom: 4 }}>
                  {note.title ?? "Untitled"}
                </Text>
                <Text size="sm" c={palette.textDim} style={{ whiteSpace: "pre-wrap" }}>
                  {(note.lines ?? []).join("\n") || "No content"}
                </Text>
              </Paper>
            ))
          )}
        </Paper>

        <Divider color={palette.border} />

        <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
          <Stack gap={2}>
            <Text size="xs" c={palette.textDim}>
              Scheduled
            </Text>
            <Text fw={700}>{formatDate(session.scheduledFor)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c={palette.textDim}>
              Location
            </Text>
            <Text fw={700}>{session.location || "Not set"}</Text>
          </Stack>
        </Group>
      </Stack>
    </Card>
  );
}
