import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Modal, Skeleton, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconFileImport, IconNotebook, IconPin, IconPlus, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { Note } from "@appTypes/Note";
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { useNoteActions, useNoteList, useNoteLoading } from "@store/note/noteSelectors";
import { NoteCard } from "@features/notes/components/NoteCard";
import { NoteEditorModal } from "@features/notes/components/NoteEditorModal";
import { noteBody, noteTags, timeAgo } from "@features/notes/noteUtils";
import classes from "@features/notes/Notes.module.css";

// Stable fallback, so the memos below don't recompute on every render.
const NO_IDS: string[] = [];

const byNewest = (a: Note, b: Note) => Date.parse(b.updatedAt ?? "0") - Date.parse(a.updatedAt ?? "0");

export default function NotesPage() {
  const character = useCurrentCharacter();
  const { updateCharacter } = useCharacterCoreActions();
  const navigate = useNavigate();
  const notes = useNoteList();
  const loading = useNoteLoading();
  const { loadForCharacter, create, update, remove } = useNoteActions();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Kept apart from `editorOpen` so the dialog doesn't switch to "New note" while it fades out.
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorNote, setEditorNote] = useState<Note | null>(null);
  const openEditor = (note: Note | null) => {
    setEditorNote(note);
    setEditorOpen(true);
  };
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [removing, setRemoving] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

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

  const noteIds = character?.noteIds ?? NO_IDS;

  useEffect(() => {
    if (!noteIds.length) return;
    loadForCharacter(noteIds).catch(() =>
      showNotification({ id: "notes-load-failed", title: "Could not load notes", message: "Showing the last saved copy.", color: "red" })
    );
  }, [noteIds, loadForCharacter]);

  const characterNotes = useMemo(
    () => notes.filter((n) => n.id && noteIds.includes(n.id)).sort(byNewest),
    [notes, noteIds]
  );

  const allTags = useMemo(() => [...new Set(characterNotes.flatMap(noteTags))].sort(), [characterNotes]);

  const query = search.trim();
  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return characterNotes.filter((note) => {
      const matchesText = !q || `${note.title ?? ""}\n${noteBody(note)}`.toLowerCase().includes(q);
      const tags = noteTags(note);
      return matchesText && activeTags.every((tag) => tags.includes(tag));
    });
  }, [characterNotes, query, activeTags]);

  const pinned = visible.filter((n) => n.isFavorite);
  const others = visible.filter((n) => !n.isFavorite);
  const filtering = !!query || activeTags.length > 0;

  const toggleTag = (tag: string) =>
    setActiveTags((tags) => (tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]));

  const togglePin = async (note: Note) => {
    try {
      await update(note.id!, { isFavorite: !note.isFavorite });
    } catch (error) {
      showNotification({ title: "Could not update the note", message: (error as Error).message, color: "red" });
    }
  };

  const confirmDelete = async () => {
    if (!deleting?.id || !character) return;
    const id = deleting.id;
    setRemoving(true);
    try {
      await remove(id);
      updateCharacter({ noteIds: (character.noteIds ?? []).filter((nid) => nid !== id) });
      setDeleting(null);
    } catch (error) {
      showNotification({ title: "Could not delete the note", message: (error as Error).message, color: "red" });
    } finally {
      setRemoving(false);
    }
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !character) return;

    try {
      const text = (await file.text()).replace(/\r\n/g, "\n");
      const heading = text.split("\n").find((line) => line.trim().startsWith("#"));
      const created = await create({
        title: heading?.replace(/^#+\s*/, "").trim() || file.name.replace(/\.[^/.]+$/, "") || "Imported note",
        lines: text.split("\n"),
      });
      updateCharacter({ noteIds: [...(character.noteIds ?? []), created.id!] });
      showNotification({ title: "Imported", message: `Added a note from ${file.name}.`, color: "teal" });
    } catch (error) {
      showNotification({ title: "Import failed", message: (error as Error).message, color: "red" });
    }
  };

  if (!character) return null;

  const latest = characterNotes[0]?.updatedAt;
  const renderCard = (note: Note) => (
    <NoteCard
      key={note.id}
      note={note}
      query={query}
      onOpen={() => openEditor(note)}
      onTogglePin={() => void togglePin(note)}
      onDelete={() => setDeleting(note)}
    />
  );

  return (
    <div className={`${classes.page} readable-surfaces`}>
      <header className={classes.header}>
        <span className={classes.headerIcon}>
          <IconNotebook size={22} stroke={1.75} />
        </span>
        <div className={classes.headerText}>
          <h1 className={classes.title}>Notes</h1>
          <p className={`${classes.subtitle} ${classes.muted}`}>
            {characterNotes.length} note{characterNotes.length === 1 ? "" : "s"}
            {latest && ` · updated ${timeAgo(latest)}`}
          </p>
        </div>
        <div className={classes.headerActions}>
          <Tooltip label="Import a Markdown file">
            <button type="button" className={classes.iconButton} onClick={() => fileInputRef.current?.click()} aria-label="Import a Markdown file">
              <IconFileImport size={18} />
            </button>
          </Tooltip>
          <button type="button" className={classes.primaryButton} onClick={() => openEditor(null)}>
            <IconPlus size={16} />
            <span className={classes.buttonLabel}>New note</span>
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".md,.markdown,text/markdown,.txt" hidden onChange={(e) => void importFile(e)} />
      </header>

      {characterNotes.length > 0 && (
        <div className={classes.toolbar}>
          <TextInput
            aria-label="Search notes"
            placeholder="Search notes"
            leftSection={<IconSearch size={15} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          {allTags.length > 0 && (
            <div className={classes.tags} role="group" aria-label="Filter by tag">
              {allTags.map((tag) => (
                <button key={tag} type="button" className={classes.tag} aria-pressed={activeTags.includes(tag)} onClick={() => toggleTag(tag)}>
                  #{tag}
                </button>
              ))}
              {activeTags.length > 0 && (
                <button type="button" className={`${classes.clearTags} ${classes.muted}`} onClick={() => setActiveTags([])}>
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {loading && !characterNotes.length ? (
        <Stack gap="sm">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={96} radius={12} />
          ))}
        </Stack>
      ) : !characterNotes.length ? (
        <div className={classes.empty}>
          <span className={classes.headerIcon}>
            <IconNotebook size={22} stroke={1.75} />
          </span>
          <p className={classes.emptyTitle}>No notes yet</p>
          <p className={`${classes.emptyText} ${classes.muted}`}>
            Keep session recaps, NPCs and clues here. Notes support Markdown, and #tags make them easy to filter.
          </p>
          <button type="button" className={classes.primaryButton} onClick={() => openEditor(null)}>
            <IconPlus size={16} /> Write your first note
          </button>
        </div>
      ) : !visible.length ? (
        <div className={classes.empty}>
          <p className={classes.emptyTitle}>No matching notes</p>
          <p className={`${classes.emptyText} ${classes.muted}`}>Try another search or clear the tag filter.</p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <section className={classes.section}>
              <h2 className={`${classes.sectionLabel} ${classes.muted}`}>
                <IconPin size={13} /> Pinned
              </h2>
              {pinned.map(renderCard)}
            </section>
          )}
          {others.length > 0 && (
            <section className={classes.section}>
              {pinned.length > 0 && (
                <h2 className={`${classes.sectionLabel} ${classes.muted}`}>{filtering ? "Other matches" : "All notes"}</h2>
              )}
              {others.map(renderCard)}
            </section>
          )}
        </>
      )}

      <NoteEditorModal opened={editorOpen} note={editorNote} onClose={() => setEditorOpen(false)} />

      <Modal
        opened={!!deleting}
        onClose={() => !removing && setDeleting(null)}
        title={<span className={classes.dialogTitle}>Delete note?</span>}
        size="sm"
        centered
        classNames={{ content: classes.dialog }}
      >
        <Text size="sm" mb="lg" className={classes.muted}>
          “{deleting?.title || "Untitled"}” will be deleted. This can't be undone.
        </Text>
        <div className={classes.dialogFooterButtons}>
          <button type="button" className={classes.secondaryButton} onClick={() => setDeleting(null)} disabled={removing}>
            Cancel
          </button>
          <button type="button" className={classes.dangerButton} onClick={() => void confirmDelete()} disabled={removing}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
