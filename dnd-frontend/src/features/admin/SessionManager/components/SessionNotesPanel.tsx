import { useEffect, useMemo, useState } from "react";
import { Button, Group, Paper, Skeleton, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useNoteStore } from "@store/useNoteStore";
import type { Note } from "@appTypes/Note";
import type { Session } from "@appTypes/Session";

interface Props {
  session: Session;
  saving: boolean;
  onUpdateNoteIds: (ids: string[]) => Promise<void>;
  editable?: boolean;
}

export function SessionNotesPanel({ session, saving, onUpdateNoteIds, editable = true }: Props) {
  const { loadMany, create: createNote, remove: removeNote } = useNoteStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const safeNoteIds = useMemo(() => (session.noteIds ?? []).filter((n): n is string => Boolean(n)), [session.noteIds]);

  useEffect(() => {
    let mounted = true;
    if (!safeNoteIds.length) {
      setNotes([]);
      setNotesError(null);
      setNotesLoading(false);
      return;
    }

    setNotesLoading(true);
    setNotesError(null);
    loadMany(safeNoteIds)
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
  }, [loadMany, safeNoteIds]);

  const handleAddNote = async () => {
    if (!editable) return;
    const title = newNoteTitle.trim();
    const content = newNoteContent.trim();
    if (!title && !content) return;
    setNotesError(null);
    try {
      const created = await createNote({ title, lines: content ? content.split("\n") : [], isDeleted: false });
      const updatedIds = [...safeNoteIds, created.id].filter((id): id is string => Boolean(id));
      await onUpdateNoteIds(updatedIds);
      setNotes((prev) => [created, ...prev]);
      setNewNoteTitle("");
      setNewNoteContent("");
    } catch (err) {
      console.warn("Failed to add note to session", err);
      setNotesError("Failed to add note");
    }
  };

  const handleRemoveNote = async (id: string | null) => {
    if (!editable) return;
    if (!id) return;
    setNotesError(null);
    try {
      await removeNote(id);
      const updatedIds = safeNoteIds.filter((n) => n !== id).filter((nid): nid is string => Boolean(nid));
      await onUpdateNoteIds(updatedIds);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.warn("Failed to remove note from session", err);
      setNotesError("Failed to remove note");
    }
  };

  return (
    <Stack gap="sm" mt="md">
      <Group justify="space-between" align="center">
        <Text fw={600}>Notes</Text>
        <Button size="xs" variant="subtle" onClick={() => void onUpdateNoteIds(safeNoteIds)} loading={notesLoading}>
          Reload
        </Button>
      </Group>
      {notesLoading ? (
        <Stack gap="xs">
          <Skeleton height={12} radius="xl" />
          <Skeleton height={12} radius="xl" />
          <Skeleton height={12} radius="xl" />
        </Stack>
      ) : notesError ? (
        <Text size="sm" c="orange.4">
          {notesError}
        </Text>
      ) : (
        <Stack gap="xs">
          {notes.map((note) => (
            <Paper key={note.id} withBorder p="sm" radius="md" style={{ background: "rgba(255,255,255,0.02)" }}>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={600} size="sm">
                    {note.title || "Untitled"}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {(note.lines ?? []).join("\n") || "No content"}
                  </Text>
                </div>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => void handleRemoveNote(note.id)}
                  loading={saving}
                  disabled={!editable}
                >
                  Remove
                </Button>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      {editable && (
        <Paper withBorder p="sm" radius="md" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Stack gap="xs">
            <Text fw={600} size="sm">
              Add Note
            </Text>
            <TextInput
              placeholder="Title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.currentTarget.value)}
              disabled={saving || !editable}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
            <Textarea
              placeholder="Content"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.currentTarget.value)}
              minRows={3}
              disabled={saving || !editable}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
            <Group justify="flex-end">
              <Button size="xs" onClick={() => void handleAddNote()} loading={saving} disabled={!editable}>
                Save Note
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
