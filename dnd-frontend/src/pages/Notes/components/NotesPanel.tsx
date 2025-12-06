import { useEffect, useRef, useState } from "react";
import {
  Box,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Text,
  SimpleGrid,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { NotesHeader } from "./NotesHeader";
import { NoteCard } from "./NoteCard";
import { NotesSearch } from "./NotesSearch";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useNoteStore } from "../../../store/useNoteStore";
import type { Note } from "../../../types/Note";
import { AddNoteModal } from "../../Profile/components/AddNoteModal";
import { EditNoteModal } from "./EditNoteModal";
import { showNotification } from "../../../components/Notification/Notification";

export function NotesPanel() {
  const character = useCharacterStore((s) => s.character);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);

  const {
    notes,
    loading,
    loadForCharacter,
    remove,
    update: updateNote,
    create,
  } = useNoteStore();

  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [tagQuery, setTagQuery] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const getTags = (note: Note) => {
    const content = [note.title ?? "", ...(note.lines ?? [])].join(" ");
    const matches = content.match(/#[a-zA-Z0-9_-]+/g) ?? [];
    return Array.from(
      new Set(matches.map((tag) => tag.slice(1).toLowerCase()))
    );
  };

  const allTags = Array.from(
    new Set(
      characterNotes.flatMap((note) => getTags(note)).filter((t) => t.length > 0)
    )
  ).sort();

  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (note: Note) => {
    if (!normalizedSearch) return true;
    const title = (note.title ?? "").toLowerCase();
    const content = (note.lines ?? []).join(" ").toLowerCase();
    return (
      title.includes(normalizedSearch) || content.includes(normalizedSearch)
    );
  };

  const matchesTags = (note: Note) => {
    if (tagQuery.length === 0) return true;
    const noteTags = getTags(note);
    return tagQuery.every((tag) => noteTags.includes(tag));
  };

  const filteredNotes = characterNotes.filter(
    (note) => matchesSearch(note) && matchesTags(note)
  );

  const favoriteNotes = filteredNotes.filter((note) => note.isFavorite);
  const regularNotes = filteredNotes.filter((note) => !note.isFavorite);
  const hasAnyNotes = characterNotes.length > 0;
  const highlightQuery = search.trim();

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
  };

  const handleToggleFavorite = async (note: Note) => {
    await updateNote(note.id!, { isFavorite: !note.isFavorite });
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !character) return;

    try {
      const text = await file.text();
      const normalized = text.replace(/\r\n/g, "\n");

      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const firstHeading = normalized
        .split("\n")
        .find((line) => line.trim().startsWith("#"));
      const titleFromHeading = firstHeading
        ? firstHeading.replace(/^#+\s*/, "").trim()
        : undefined;

      const newNote = await create({
        title: titleFromHeading || fileName || "Imported note",
        lines: normalized.split("\n"),
      });

      const currentIds = character.noteIds ?? [];
      updateCharacter({
        noteIds: [...currentIds, newNote.id!],
      });
      await persistCharacter();

      showNotification({
        title: "Imported",
        message: `Added note from ${file.name}`,
        color: "teal",
      });
    } catch (error) {
      console.error("Failed to import markdown", error);
      showNotification({
        title: "Import failed",
        message: "Could not import markdown file.",
        color: "red",
      });
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
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
          onImport={handleTriggerImport}
          tags={allTags}
          tagValue={tagQuery}
          onTagsChange={setTagQuery}
          showTagFilter={showTagFilter}
          toggleTagFilter={() => setShowTagFilter((v) => !v)}
        />

        <NotesSearch value={search} onChange={setSearch} />

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,text/markdown,.txt"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />

        <Box
          mt="xs"
          style={{
            flex: 1,
            overflowY: isMobile ? "auto" : "visible",
            paddingRight: isMobile ? 4 : 0,
          }}
        >
          {loading && filteredNotes.length === 0 ? (
            <Stack gap="sm">
              {[1, 2, 3].map((item) => (
                <Paper
                  key={item}
                  withBorder
                  p="sm"
                  style={{
                    background: "rgba(50, 0, 0, 0.2)",
                    border: "1px solid rgba(255,80,80,0.25)",
                  }}
                >
                  <Skeleton height={14} width="40%" mb="xs" radius="sm" />
                  <Skeleton height={10} width="90%" mb={6} radius="sm" />
                  <Skeleton height={10} width="80%" mb={6} radius="sm" />
                  <Skeleton height={10} width="70%" radius="sm" />
                </Paper>
              ))}
            </Stack>
          ) : (
            <Stack gap="sm">
              {favoriteNotes.length > 0 && (
                <>
                  <Text size="sm" fw={600} c="red.2">
                    Favorites
                  </Text>
                  <SimpleGrid
                    cols={isMobile ? 1 : 2}
                    spacing={isMobile ? "sm" : "md"}
                    verticalSpacing={isMobile ? "sm" : "md"}
                  >
                    {favoriteNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        searchQuery={highlightQuery}
                        onToggleFavorite={() => handleToggleFavorite(note)}
                        onEdit={() => setEditingNote(note)}
                        onDelete={() => handleDelete(note.id!)}
                      />
                    ))}
                  </SimpleGrid>
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

              <SimpleGrid
                cols={isMobile ? 1 : 2}
                spacing={isMobile ? "sm" : "md"}
                verticalSpacing={isMobile ? "sm" : "md"}
              >
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    searchQuery={highlightQuery}
                    onToggleFavorite={() => handleToggleFavorite(note)}
                    onEdit={() => setEditingNote(note)}
                    onDelete={() => handleDelete(note.id!)}
                  />
                ))}
              </SimpleGrid>

              {!loading && filteredNotes.length === 0 && (
                <Text c="dimmed" ta="center">
                  {hasAnyNotes ? "No notes match your search." : "No notes yet."}
                </Text>
              )}
            </Stack>
          )}
        </Box>
      </Paper>
    </>
  );
}
