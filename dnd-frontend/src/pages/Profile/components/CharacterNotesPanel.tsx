import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Stack,
  Text,
  ActionIcon,
  Group,
  Tooltip,
  Table,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconRefresh,
  IconPencil,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useNoteStore } from "../../../store/useNoteStore";
import { AddNoteModal } from "./AddNoteModal";
import type { Note } from "../../../types/Note";
import { EditNoteModal } from "../EditNoteModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../../styles/glassyInput.css";

export function CharacterNotesPanel() {
  const character = useCharacterStore((s) => s.character);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const persistCharacter = useCharacterStore((s) => s.persistCharacter);

  const notes = useNoteStore((s) => s.notes);
  const loading = useNoteStore((s) => s.loading);
  const loadForCharacter = useNoteStore((s) => s.loadForCharacter);
  const remove = useNoteStore((s) => s.remove);
  const updateNote = useNoteStore((s) => s.update);

  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const characterId = character?.id;
  const rawNoteIds = character?.noteIds;

  const noteIds = useMemo(() => rawNoteIds ?? [], [rawNoteIds]);

  const characterNotes = useMemo(() => {
    const filtered = notes.filter((n) => n.id && noteIds.includes(n.id));
    // favorites first
    return filtered.sort(
      (a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
    );
  }, [notes, noteIds]);

  useEffect(() => {
    if (!characterId || noteIds.length === 0) return;
    void loadForCharacter(noteIds);
  }, [characterId, noteIds, loadForCharacter]);

  async function reloadNotes() {
    if (!characterId || noteIds.length === 0) return;
    await loadForCharacter(noteIds);
  }

  async function handleDelete(id: string) {
    await remove(id);

    if (!character) return;

    const currentIds = character.noteIds ?? [];
    if (!currentIds.includes(id)) return;

    updateCharacter({
      noteIds: currentIds.filter((nid) => nid !== id),
    });

    await persistCharacter();
  }

  async function handleToggleFavorite(note: Note) {
    await updateNote(note.id!, {
      isFavorite: !note.isFavorite,
    });
  }

  return (
    <>
      <AddNoteModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />

      <EditNoteModal
        opened={!!editingNote}
        note={editingNote}
        onClose={() => setEditingNote(null)}
      />

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(20, 0, 0, 0.35)",
          border: "1px solid rgba(255, 60, 60, 0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* HEADER */}
        <Group justify="space-between" mb="sm">
          <Text size="lg" fw={600} c="red.3">
            Personal Notes
          </Text>

          <Group gap="xs">
            {/* RELOAD BUTTON */}
            <ActionIcon
              size="md"
              radius="xl"
              variant="light"
              onClick={reloadNotes}
              style={{
                background: "rgba(255,0,0,0.25)",
                border: "1px solid rgba(255,100,100,0.5)",
                backdropFilter: "blur(6px)",
                color: "rgba(255,200,200,0.9)",
                transition: "0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,0,0,0.45)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,0,0,0.25)";
                e.currentTarget.style.color = "rgba(255,200,200,0.9)";
              }}
            >
              <IconRefresh size={16} />
            </ActionIcon>

            {/* ADD BUTTON */}
            <ActionIcon
              size="md"
              radius="xl"
              variant="light"
              onClick={() => setAddModalOpened(true)}
              style={{
                background: "rgba(255,0,0,0.35)",
                border: "1px solid rgba(255,100,100,0.6)",
                backdropFilter: "blur(6px)",
                color: "white",
                boxShadow: "0 0 6px rgba(255,60,60,0.6)",
                transition: "0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,0,0,0.55)";
                e.currentTarget.style.boxShadow =
                  "0 0 10px rgba(255,80,80,0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,0,0,0.35)";
                e.currentTarget.style.boxShadow =
                  "0 0 6px rgba(255,60,60,0.6)";
              }}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {loading && <Text c="dimmed">Loading notes…</Text>}

        {/* NOTES LIST */}
        <Stack gap="sm">
          {characterNotes.map((note) => {
            const markdownContent = (note.lines ?? []).join("\n");

            return (
              <Paper
                key={note.id}
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
                    <Tooltip label="Favorite" withArrow>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleToggleFavorite(note)}
                      >
                        {note.isFavorite ? (
                          <IconStarFilled size={14} color="yellow" />
                        ) : (
                          <IconStar size={14} />
                        )}
                      </ActionIcon>
                    </Tooltip>

                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => setEditingNote(note)}
                    >
                      <IconPencil size={12} />
                    </ActionIcon>

                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(note.id!)}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Group>
                </Group>

                {/* Markdown-rendered content */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <Text
                        size="sm"
                        c="gray.2"
                        style={{ margin: 0, lineHeight: 1.4 }}
                        {...props}
                      />
                    ),
                    h1: ({ node, ...props }) => (
                      <Text
                        component="h1"
                        size="lg"
                        fw={800}
                        tt="uppercase"
                        style={{ margin: "4px 0", lineHeight: 1.2 }}
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <Text
                        component="h2"
                        size="md"
                        fw={700}
                        tt="uppercase"
                        style={{ margin: "4px 0", lineHeight: 1.2 }}
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <Text
                        component="h3"
                        size="sm"
                        fw={700}
                        tt="uppercase"
                        style={{ margin: "4px 0", lineHeight: 1.2 }}
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        style={{
                          margin: "4px 0",
                          paddingLeft: "1.2rem",
                        }}
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        style={{
                          margin: "4px 0",
                          paddingLeft: "1.2rem",
                        }}
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li style={{ marginBottom: 2 }} {...props} />
                    ),
                    table: ({ node, ...props }) => (
                      <Table
                        striped
                        highlightOnHover
                        withTableBorder
                        withColumnBorders
                        style={{ margin: "8px 0" }}
                        {...props}
                      />
                    ),
                    th: ({ node, ...props }) => (
                      <Table.Th
                        style={{
                          textAlign: "left",
                          padding: "5px",
                          fontWeight: 600,
                        }}
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <Table.Td
                        style={{
                          textAlign: "left",
                          padding: "5px",
                        }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </Paper>
            );
          })}

          {!loading && characterNotes.length === 0 && (
            <Text c="dimmed" ta="center">
              No notes yet.
            </Text>
          )}
        </Stack>
      </Paper>
    </>
  );
}
