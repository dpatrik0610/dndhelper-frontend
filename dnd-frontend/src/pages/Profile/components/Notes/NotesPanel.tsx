import { useEffect, useState } from "react";
import { Paper, Stack, Text } from "@mantine/core";
import { useCharacterStore } from "../../../../store/useCharacterStore";
import { useNoteStore } from "../../../../store/useNoteStore";
import { AddNoteModal } from "../AddNoteModal";
import { EditNoteModal } from "../../EditNoteModal";
import type { Note } from "../../../../types/Note";
import { NotesHeader } from "./NotesHeader";
import { NoteCard } from "./NoteCard";
import "../../../../styles/glassyInput.css"

export function NotesPanel() {
  const character = useCharacterStore((s) => s.character);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const persistCharacter = useCharacterStore((s) => s.persistCharacter);

  const { notes, loading, loadForCharacter, remove, update: updateNote } =
    useNoteStore();

  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const characterId = character?.id;
  const noteIds = character?.noteIds ?? [];

  const characterNotes = notes
    .filter((n) => n.id && noteIds.includes(n.id))
    .slice()
    .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())

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
      <AddNoteModal opened={addModalOpened} onClose={() => setAddModalOpened(false)} />
      <EditNoteModal opened={!!editingNote} note={editingNote} onClose={() => setEditingNote(null)} />

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(20, 0, 0, 0.35)",
          border: "1px solid rgba(255, 60, 60, 0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <NotesHeader
          loading={loading}
          onReload={reloadNotes}
          onAdd={() => setAddModalOpened(true)}
        />

        <Stack gap="sm">
          {characterNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onToggleFavorite={() => handleToggleFavorite(note)}
              onEdit={() => setEditingNote(note)}
              onDelete={() => handleDelete(note.id!)}
            />
          ))}

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
