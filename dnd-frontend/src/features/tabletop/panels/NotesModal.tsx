import { Suspense, lazy, useEffect, useState } from "react";
import { ActionIcon, Center, Group, Loader, Modal, Spoiler, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconNotebook, IconPencil, IconPinFilled, IconSearch } from "@tabler/icons-react";
import type { Note } from "@appTypes/Note";
import { useIsMobile } from "@hooks/useIsMobile";
import { useNoteActions, useNoteList } from "@store/note/noteSelectors";
import { NoteEditorModal } from "@features/notes/components/NoteEditorModal";
import { noteBody } from "@features/notes/noteUtils";
import { useMyTableCharacter } from "@features/tabletop/characterSheet";
import { timeAgo } from "@utils/timeAgo";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

// Pinned first, then newest.
const order = (a: Note, b: Note) =>
  Number(!!b.isFavorite) - Number(!!a.isFavorite) || Date.parse(b.updatedAt ?? "0") - Date.parse(a.updatedAt ?? "0");

/** Notebook icon in the top bar; only there while the viewer has a character on the table. */
export function NotesButton() {
  const character = useMyTableCharacter();
  const [opened, setOpened] = useState(false);
  if (!character) return null;

  return (
    <>
      <Tooltip label="My notes">
        <ActionIcon variant="subtle" color="gray" onClick={() => setOpened(true)} aria-label="My notes">
          <IconNotebook size={18} />
        </ActionIcon>
      </Tooltip>
      <NotesModal opened={opened} onClose={() => setOpened(false)} name={character.name} noteIds={character.noteIds ?? []} />
    </>
  );
}

/** The character's notes over the table, searchable; the pencil opens the regular note editor. */
function NotesModal({ opened, onClose, name, noteIds }: { opened: boolean; onClose: () => void; name: string; noteIds: string[] }) {
  const isMobile = useIsMobile();
  const notes = useNoteList();
  const { loadForCharacter } = useNoteActions();
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  // Kept apart from `editorOpen` so the editor doesn't switch to "New note" while it fades out.
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const edit = (note: Note) => {
    setEditing(note);
    setEditorOpen(true);
  };
  const idsKey = noteIds.join(",");

  // Loaded on every open, so notes written elsewhere show up.
  useEffect(() => {
    if (!opened) return;
    let cancelled = false;
    setLoaded(false);
    void loadForCharacter(idsKey ? idsKey.split(",") : [])
      .catch(() => [])
      .then(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [opened, idsKey, loadForCharacter]);

  const query = search.trim().toLowerCase();
  const mine = notes.filter((n) => n.id && noteIds.includes(n.id)).sort(order);
  const visible = mine.filter((n) => !query || `${n.title ?? ""}\n${noteBody(n)}`.toLowerCase().includes(query));

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="lg"
        fullScreen={isMobile}
        classNames={{ content: "tt-solid", header: "tt-solid" }}
        title={
          <Group gap={8}>
            <IconNotebook size={18} />
            <Text fw={700}>{name}'s notes</Text>
          </Group>
        }
      >
        {!loaded && mine.length === 0 ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : mine.length === 0 ? (
          <Text c="dimmed" ta="center" py="lg">
            This character has no notes yet.
          </Text>
        ) : (
          <Stack gap="md">
            <TextInput
              size="xs"
              placeholder="Search notes"
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              data-autofocus
            />
            {visible.length === 0 && (
              <Text size="xs" c="dimmed">
                No matching notes.
              </Text>
            )}
            {visible.map((note) => (
              <div key={note.id} className="tt-item tt-note">
                <Group justify="space-between" gap="xs" wrap="nowrap">
                  <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                    {note.isFavorite && <IconPinFilled size={13} />}
                    <Text size="sm" fw={600} truncate>
                      {note.title || "Untitled"}
                    </Text>
                  </Group>
                  <Group gap={6} wrap="nowrap">
                    {note.updatedAt && (
                      <Text size="xs" c="dimmed">
                        {timeAgo(note.updatedAt)}
                      </Text>
                    )}
                    <Tooltip label="Edit">
                      <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => edit(note)} aria-label={`Edit ${note.title || "note"}`}>
                        <IconPencil size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
                {noteBody(note).trim() && (
                  <Spoiler maxHeight={160} showLabel="Show more" hideLabel="Show less">
                    <Suspense fallback={<Loader size="sm" />}>
                      <MarkdownRenderer content={noteBody(note)} highlightQuery={query || undefined} textColor="var(--theme-color-text-primary, #fff)" />
                    </Suspense>
                  </Spoiler>
                )}
              </div>
            ))}
          </Stack>
        )}
      </Modal>
      <NoteEditorModal opened={editorOpen} note={editing} onClose={() => setEditorOpen(false)} />
    </>
  );
}
