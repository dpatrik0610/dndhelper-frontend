import { Suspense, lazy, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Loader, Modal, Skeleton, Stack, TextInput, Tooltip } from "@mantine/core";
import { IconArrowLeft, IconArrowsMaximize, IconPencil, IconPinFilled, IconPlus, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { Note } from "@appTypes/Note";
import { useIsMobile } from "@hooks/useIsMobile";
import { useNoteList } from "@store/note/noteSelectors";
import { NoteEditorForm } from "@features/notes/components/NoteEditorModal";
import { useCharacterNotes, useNoteDraft, useNoteKeyNav } from "@features/notes/noteHooks";
import { noteBody, noteMatches } from "@features/notes/noteUtils";
import { timeAgo } from "@utils/timeAgo";
import classes from "@features/notes/Notes.module.css";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

interface NotesPanelModalProps {
  opened: boolean;
  onClose: () => void;
}

const snippet = (note: Note) =>
  noteBody(note)
    .split("\n")
    .map((line) => line.replace(/^[\s#>*-]+/, "").trim())
    .find(Boolean) ?? "";

export function NotesPanelModal({ opened, onClose }: NotesPanelModalProps) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const note = useNoteList().find((n) => n.id === openId) ?? null;
  const draft = useNoteDraft(note, editing);
  const view = editing ? "edit" : note ? "read" : "list";
  const locked = draft.saving || (editing && draft.dirty);

  const back = () => {
    if (editing) return setEditing(false);
    setFocusId(openId);
    setOpenId(null);
  };

  const reset = () => {
    setSearch("");
    setOpenId(null);
    setFocusId(null);
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || view === "list" || locked) return;
    e.stopPropagation();
    back();
  };

  const title = view === "list" ? "Notes" : view === "read" ? note?.title || "Untitled" : note ? "Edit note" : "New note";

  return (
    <Modal
      opened={opened}
      onClose={() => !draft.saving && onClose()}
      onExitTransitionEnd={reset}
      title={
        <span className={classes.panelTitle}>
          {view !== "list" && (
            <button type="button" className={classes.cardAction} onClick={back} disabled={draft.saving} aria-label="Back">
              <IconArrowLeft size={16} />
            </button>
          )}
          <span className={`${classes.dialogTitle} ${classes.panelEllipsis}`}>{title}</span>
        </span>
      }
      size={view === "list" ? "md" : "lg"}
      fullScreen={isMobile && view !== "list"}
      centered
      closeOnClickOutside={!locked}
      closeOnEscape={view === "list"}
      classNames={{ content: classes.dialog }}
    >
      <div onKeyDown={onKeyDown}>
        {view === "list" && (
          <NotesList
            search={search}
            onSearch={setSearch}
            focusId={focusId}
            onOpen={(n) => setOpenId(n.id!)}
            onNew={() => setEditing(true)}
            onClose={onClose}
          />
        )}
        {view === "read" && note && <NoteReader note={note} onEdit={() => setEditing(true)} />}
        {view === "edit" && (
          <NoteEditorForm
            note={note}
            draft={draft}
            onCancel={back}
            onSaved={(saved) => {
              setOpenId(saved.id ?? null);
              setEditing(false);
            }}
          />
        )}
      </div>
    </Modal>
  );
}

function NoteReader({ note, onEdit }: { note: Note; onEdit: () => void }) {
  const body = noteBody(note);
  return (
    <Stack gap="md">
      <div className={classes.dialogFooter}>
        <span className={`${classes.subtitle} ${classes.muted}`}>{note.updatedAt && `Updated ${timeAgo(note.updatedAt)}`}</span>
        <button type="button" className={classes.primaryButton} onClick={onEdit} autoFocus>
          <IconPencil size={16} /> Edit
        </button>
      </div>
      <div className={`${classes.preview} ${classes.panelReader}`}>
        {body.trim() ? (
          <Suspense fallback={<Loader size="sm" />}>
            <MarkdownRenderer content={body} textColor="var(--theme-color-text-primary, #fff)" />
          </Suspense>
        ) : (
          <span className={classes.muted}>This note is empty.</span>
        )}
      </div>
    </Stack>
  );
}

interface NotesListProps {
  search: string;
  onSearch: (search: string) => void;
  focusId: string | null;
  onOpen: (note: Note) => void;
  onNew: () => void;
  onClose: () => void;
}

function NotesList({ search, onSearch, focusId, onOpen, onNew, onClose }: NotesListProps) {
  const navigate = useNavigate();
  const { character, notes, loading } = useCharacterNotes();
  const panelRef = useRef<HTMLDivElement>(null);
  useNoteKeyNav(panelRef);

  useEffect(() => {
    if (focusId) panelRef.current?.querySelector<HTMLElement>(`[data-note-id="${focusId}"]`)?.focus();
  }, [focusId]);

  if (!character) return <p className={classes.muted}>Select a character to keep notes.</p>;

  const query = search.trim();
  const matches = notes.filter((n) => noteMatches(n, query));
  const visible = [...matches.filter((n) => n.isFavorite), ...matches.filter((n) => !n.isFavorite)];

  return (
    <div ref={panelRef} className={classes.panel}>
      <div className={classes.panelBar}>
        <TextInput
          className={classes.panelSearch}
          aria-label="Search notes"
          placeholder="Search notes"
          leftSection={<IconSearch size={15} />}
          value={search}
          onChange={(e) => onSearch(e.currentTarget.value)}
          data-autofocus
          data-note-nav
        />
        <Tooltip label="Open the notes page">
          <button
            type="button"
            className={classes.iconButton}
            aria-label="Open the notes page"
            onClick={() => {
              onClose();
              navigate("/notes");
            }}
          >
            <IconArrowsMaximize size={16} />
          </button>
        </Tooltip>
        <button type="button" className={classes.primaryButton} onClick={onNew}>
          <IconPlus size={16} />
          <span className={classes.buttonLabel}>New note</span>
        </button>
      </div>

      {loading && !notes.length ? (
        <Stack gap={6}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={52} radius={10} />
          ))}
        </Stack>
      ) : !visible.length ? (
        <p className={`${classes.panelEmpty} ${classes.muted}`}>{notes.length ? "No matching notes." : "No notes yet."}</p>
      ) : (
        <div className={classes.panelList} role="list">
          {visible.map((note) => (
            <button
              key={note.id}
              type="button"
              role="listitem"
              className={classes.panelRow}
              onClick={() => onOpen(note)}
              data-note-nav
              data-note-id={note.id}
            >
              <span className={classes.panelRowTitle}>
                {note.isFavorite && <IconPinFilled size={12} className={classes.panelPin} />}
                <span className={classes.panelEllipsis}>{note.title || "Untitled"}</span>
                {note.updatedAt && <span className={`${classes.panelRowTime} ${classes.muted}`}>{timeAgo(note.updatedAt)}</span>}
              </span>
              {snippet(note) && <span className={`${classes.panelEllipsis} ${classes.panelRowSnippet} ${classes.muted}`}>{snippet(note)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
