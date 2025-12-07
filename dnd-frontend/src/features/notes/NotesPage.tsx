import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@components/Notification/Notification";
import { useCharacterStore } from "@store/useCharacterStore";
import { SectionColor } from "@appTypes/SectionColor";
import { useNoteStore } from "@store/useNoteStore";
import type { Note } from "@appTypes/Note";
import { AddNoteModal } from "@features/profile/components/AddNoteModal";
import { EditNoteModal } from "./components/EditNoteModal";
import { NotesPanel } from "./components/NotesPanel";

export default function NotesPage() {
  const character = useCharacterStore((state) => state.character);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (!character) {
      showNotification({
        id: "no-character-selected",
        title: "No Character Selected",
        message: "Please select a character to view notes.",
        color: SectionColor.Red,
        withBorder: true,
      });

      navigate("/home", { replace: true });
    }
  }, [character, navigate]);

  const characterId = character?.id;
  const noteIds = character?.noteIds ?? [];

  useEffect(() => {
    if (!characterId || noteIds.length === 0) return;
    void loadForCharacter(noteIds);
  }, [characterId, noteIds, loadForCharacter]);

  const getTags = (note: Note) => {
    const content = [note.title ?? "", ...(note.lines ?? [])].join(" ");
    const matches = content.match(/#[a-zA-Z0-9_-]+/g) ?? [];
    return Array.from(new Set(matches.map((tag) => tag.slice(1).toLowerCase())));
  };

  const characterNotes = notes
    .filter((n) => n.id && noteIds.includes(n.id))
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() -
        new Date(a.updatedAt ?? 0).getTime()
    );

  const allTags = useMemo(
    () =>
      Array.from(
        new Set(characterNotes.flatMap((note) => getTags(note)).filter((t) => t.length > 0))
      ).sort(),
    [characterNotes]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (note: Note) => {
    if (!normalizedSearch) return true;
    const title = (note.title ?? "").toLowerCase();
    const content = (note.lines ?? []).join(" ").toLowerCase();
    return title.includes(normalizedSearch) || content.includes(normalizedSearch);
  };

  const matchesTags = (note: Note) => {
    if (tagQuery.length === 0) return true;
    const noteTags = getTags(note);
    return tagQuery.every((tag) => noteTags.includes(tag));
  };

  const filteredNotes = characterNotes.filter((note) => matchesSearch(note) && matchesTags(note));
  const favoriteNotes = filteredNotes.filter((note) => note.isFavorite);
  const regularNotes = filteredNotes.filter((note) => !note.isFavorite);
  const hasAnyNotes = characterNotes.length > 0;
  const highlightQuery = search.trim();

  const summary = useMemo(() => {
    const latestUpdate = characterNotes
      .filter((note) => note.updatedAt)
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() -
          new Date(a.updatedAt ?? 0).getTime()
      )[0];

    const favoritesCount = filteredNotes.filter((n) => n.isFavorite).length;

    return {
      total: characterNotes.length,
      favorites: favoritesCount,
      tags: allTags.length,
      filtered: filteredNotes.length,
      latestUpdatedAt: latestUpdate?.updatedAt,
      characterName: character?.name,
    };
  }, [allTags.length, character?.name, characterNotes, filteredNotes]);

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

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
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

  if (!character) return null;

  return (
    <Box
      p={isMobile ? "0" : "md"}
      m="0 auto"
      maw={isMobile ? "100%" : 1300}
      w="100%"
      mih="100vh"
    >
      <AddNoteModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />
      <EditNoteModal
        opened={!!editingNote}
        note={editingNote}
        onClose={() => setEditingNote(null)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/markdown,.txt"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />
      <NotesPanel
        isMobile={isMobile}
        loading={loading}
        summary={summary}
        search={search}
        onSearchChange={setSearch}
        allTags={allTags}
        tagQuery={tagQuery}
        onTagsChange={setTagQuery}
        showTagFilter={showTagFilter}
        toggleTagFilter={() => setShowTagFilter((v) => !v)}
        favoriteNotes={favoriteNotes}
        regularNotes={regularNotes}
        filteredCount={filteredNotes.length}
        hasAnyNotes={hasAnyNotes}
        highlightQuery={highlightQuery}
        onToggleFavorite={(note) => void handleToggleFavorite(note)}
        onEdit={(note) => setEditingNote(note)}
        onDelete={(id) => void handleDelete(id)}
        onAdd={() => setAddModalOpened(true)}
        onImportClick={handleTriggerImport}
        onReload={reloadNotes}
      />
    </Box>
  );
}
