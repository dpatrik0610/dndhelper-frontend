import { useEffect, useState } from "react";
import { Box, Divider, Paper, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { NotesHeader } from "./NotesHeader";
import { NoteCard } from "./NoteCard";
import { NotesSearch } from "./NotesSearch";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useNoteStore } from "../../../store/useNoteStore";
import type { Note } from "../../../types/Note";
import { AddNoteModal } from "../../Profile/components/AddNoteModal";
import { EditNoteModal } from "../../Profile/EditNoteModal";
import "../../../styles/glassyInput.css";

export function NotesPanel() {
  const character = useCharacterStore((s) => s.character);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const persistCharacter = useCharacterStore((s) => s.persistCharacter);

  const { notes, loading, loadForCharacter, remove, update: updateNote } =
    useNoteStore();

  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const characterId = character?.id;
  const noteIds = character?.noteIds ?? [];

  const characterNotes = notes
    .filter((n) => n.id && noteIds.includes(n.id))
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() -
        new Date(a.updatedAt ?? 0).getTime()
    );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredNotes = normalizedSearch
    ? characterNotes.filter((note) => {
        const title = (note.title ?? "").toLowerCase();
        const content = (note.lines ?? []).join(" ").toLowerCase();
        return (
          title.includes(normalizedSearch) || content.includes(normalizedSearch)
        );
      })
    : characterNotes;

  const favoriteNotes = filteredNotes.filter((note) => note.isFavorite);
  const regularNotes = filteredNotes.filter((note) => !note.isFavorite);
  const hasAnyNotes = characterNotes.length > 0;

  useEffect(() => {
    if (!characterId || noteIds.length === 0) return;
    void loadForCharacter(noteIds);
  }, [characterId, noteIds, loadForCharacter]);

  const reloadNotes = async () => {
    if (!characterId || noteIds.length === 0) return;
    await loadForCharacter(noteIds);
  };

  const handleDelete = async (id: string) => {
    await remove(id);

    if (!character) return;

    const currentIds = character.noteIds ?? [];
    if (!currentIds.includes(id)) return;

    updateCharacter({
      noteIds: currentIds.filter((nid) => nid !== id),
    });

    await persistCharacter();
  };

  const handleToggleFavorite = async (note: Note) => {
    await updateNote(note.id!, { isFavorite: !note.isFavorite });
  };

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
        p={isMobile ? "sm" : "md"}
        style={{
          background: "rgba(20, 0, 0, 0.35)",
          border: "1px solid rgba(255, 60, 60, 0.35)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          height: isMobile ? "100vh" : "auto",
          minHeight: isMobile ? "100vh" : "auto",
          maxHeight: isMobile ? "100vh" : "none",
          overflow: isMobile ? "hidden" : "visible",
        }}
      >
        <NotesHeader
          loading={loading}
          onReload={reloadNotes}
          onAdd={() => setAddModalOpened(true)}
        />

        <NotesSearch value={search} onChange={setSearch} />

        <Box
          mt="xs"
          style={{
            flex: 1,
            overflowY: isMobile ? "auto" : "visible",
            paddingRight: isMobile ? 4 : 0,
          }}
        >
          <Stack gap="sm">
            {favoriteNotes.length > 0 && (
              <>
                <Text size="sm" fw={600} c="red.2">
                  Favorites
                </Text>
                {favoriteNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onToggleFavorite={() => handleToggleFavorite(note)}
                    onEdit={() => setEditingNote(note)}
                    onDelete={() => handleDelete(note.id!)}
                  />
                ))}
                {regularNotes.length > 0 && (
                  <Divider
                    variant="dashed"
                    label="More notes"
                    labelPosition="center"
                    color="rgba(255,100,100,0.45)"
                    style={{ borderColor: "rgba(255,100,100,0.45)" }}
                  />
                )}
              </>
            )}

            {regularNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onToggleFavorite={() => handleToggleFavorite(note)}
                onEdit={() => setEditingNote(note)}
                onDelete={() => handleDelete(note.id!)}
              />
            ))}

            {!loading && filteredNotes.length === 0 && (
              <Text c="dimmed" ta="center">
                {hasAnyNotes ? "No notes match your search." : "No notes yet."}
              </Text>
            )}
          </Stack>
        </Box>
      </Paper>
    </>
  );
}
