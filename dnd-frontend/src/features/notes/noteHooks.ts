import { useEffect, useMemo, useState, type RefObject } from "react";
import type { Note } from "@appTypes/Note";
import { showNotification } from "@components/Notification/Notification";
import { useCharacterCoreActions, useCurrentCharacter } from "@store/character/characterSelectors";
import { useNoteActions, useNoteList, useNoteLoading } from "@store/note/noteSelectors";
import { noteBody } from "@features/notes/noteUtils";

const NO_IDS: string[] = [];

const byNewest = (a: Note, b: Note) => Date.parse(b.updatedAt ?? "0") - Date.parse(a.updatedAt ?? "0");

export function useCharacterNotes() {
  const character = useCurrentCharacter();
  const notes = useNoteList();
  const loading = useNoteLoading();
  const { loadForCharacter } = useNoteActions();
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

  return { character, notes: characterNotes, loading };
}

export function useNoteKeyNav(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== "ArrowDown" && e.key !== "ArrowUp") || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const container = ref.current;
      const target = e.target as HTMLElement;
      if (!container || (target !== document.body && !container.contains(target))) return;
      if (target.isContentEditable || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
      const items = [...container.querySelectorAll<HTMLElement>("[data-note-nav]")];
      if (!items.length) return;
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      const i = items.indexOf(target);
      const next = items[i < 0 ? (step > 0 ? 0 : items.length - 1) : Math.min(items.length - 1, Math.max(0, i + step))];
      next.focus();
      next.scrollIntoView({ block: "nearest" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ref]);
}

export type NoteDraft = ReturnType<typeof useNoteDraft>;

export function useNoteDraft(note: Note | null, active: boolean) {
  const character = useCurrentCharacter();
  const { updateCharacter } = useCharacterCoreActions();
  const { create, update } = useNoteActions();

  const initialTitle = note?.title ?? "";
  const initialBody = note ? noteBody(note) : "";
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);

  // Each open starts from the note as saved (or blank for a new one).
  useEffect(() => {
    if (!active) return;
    setTitle(initialTitle);
    setBody(initialBody);
    setMode("write");
  }, [active, initialTitle, initialBody]);

  const dirty = title !== initialTitle || body !== initialBody;

  async function save(): Promise<Note | null> {
    if (!title.trim() && !body.trim()) {
      showNotification({ title: "Nothing to save", message: "Give the note a title or some text first.", color: "yellow" });
      return null;
    }

    setSaving(true);
    try {
      const lines = body.split("\n");
      if (note?.id) return await update(note.id, { title: title.trim() || "Untitled note", lines });
      if (!character) return null;
      const created = await create({ title: title.trim() || "Untitled note", lines });
      updateCharacter({ noteIds: [...(character.noteIds ?? []), created.id!] });
      return created;
    } catch (error) {
      showNotification({ title: "Could not save the note", message: (error as Error).message, color: "red" });
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { title, setTitle, body, setBody, mode, setMode, saving, dirty, save };
}
