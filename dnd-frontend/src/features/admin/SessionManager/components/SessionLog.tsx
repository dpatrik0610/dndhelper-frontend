import { Suspense, lazy, useState, type KeyboardEvent } from "react";
import { ActionIcon, Button, Loader, ScrollArea, Switch, Textarea, Tooltip } from "@mantine/core";
import { IconCheck, IconPencil, IconSend, IconTrash, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { Session, SessionNote } from "@appTypes/Session";
import { useSessionStore } from "@store/session/sessionStore";
import shared from "@styles/InventoryDashboard.module.css";
import classes from "@features/admin/SessionManager/SessionManager.module.css";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

const switchClasses = { root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb" };

function stamp(note: SessionNote, session: Session) {
  const at = dayjs(note.createdAt);
  if (session.startedAt && session.status !== "Planned") {
    const minutes = at.diff(dayjs(session.startedAt), "minute");
    if (minutes >= 0 && minutes < 24 * 60) return `+${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
  }
  return at.format("MMM D, HH:mm");
}

const submitOnEnter = (submit: () => void) => (e: KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
    e.preventDefault();
    submit();
  }
};

export function SessionLog({ session }: { session: Session }) {
  const { addNote, updateNote, removeNote } = useSessionStore();
  const [text, setText] = useState("");
  const [dmOnly, setDmOnly] = useState(true);
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState<{ id: string; content: string; dmOnly: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const notes = [...session.notes].reverse();

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    if (await addNote(session.id, { content, dmOnly })) setText("");
    setSending(false);
  };

  const saveEdit = async () => {
    if (!editing?.content.trim()) return;
    if (await updateNote(session.id, editing.id, { content: editing.content.trim(), dmOnly: editing.dmOnly })) setEditing(null);
  };

  const remove = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    setConfirmDelete(null);
    await removeNote(session.id, id);
  };

  return (
    <>
      <div className={shared.itemsPanelHeader}>
        <span className={shared.itemsPanelTitle}>Session log ({session.notes.length})</span>
      </div>

      <div className={classes.composer}>
        <Textarea
          aria-label="New log entry"
          placeholder={session.status === "Live" ? "What just happened?" : "Jot something down…"}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onKeyDown={submitOnEnter(() => void send())}
          autosize
          minRows={2}
          maxRows={8}
        />
        <div className={classes.composerRow}>
          <label className={classes.visibility}>
            <Switch size="xs" checked={!dmOnly} onChange={(e) => setDmOnly(!e.currentTarget.checked)} classNames={switchClasses} />
            {dmOnly ? "Only you can see this" : "Players can see this"}
          </label>
          <Button
            size="xs"
            className="glass-btn-primary"
            leftSection={<IconSend size={13} />}
            onClick={() => void send()}
            loading={sending}
            disabled={!text.trim()}
          >
            Add
          </Button>
        </div>
        <span className={classes.saveState}>Enter adds · Shift+Enter new line · Markdown works</span>
      </div>

      <ScrollArea className={shared.itemsPanelBody} offsetScrollbars>
        {notes.length === 0 ? (
          <p className={classes.empty}>Nothing logged yet. Notes added here are timestamped as you play.</p>
        ) : (
          <div className={classes.log}>
            {notes.map((note) => (
              <article key={note.id} className={classes.note} data-dm-only={note.dmOnly || undefined}>
                <div className={classes.noteMeta}>
                  <span>{stamp(note, session)}</span>
                  {note.author && <span>{note.author}</span>}
                  {note.dmOnly && <span className={classes.dmBadge}>DM only</span>}
                  {editing?.id !== note.id && (
                    <div className={classes.noteActions}>
                      <Tooltip label="Edit" withArrow>
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          aria-label="Edit note"
                          onClick={() => setEditing({ id: note.id, content: note.content, dmOnly: note.dmOnly })}
                        >
                          <IconPencil size={12} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={confirmDelete === note.id ? "Click again to delete" : "Delete"} withArrow>
                        <ActionIcon
                          size="xs"
                          variant={confirmDelete === note.id ? "filled" : "subtle"}
                          color="red"
                          aria-label={confirmDelete === note.id ? "Confirm delete" : "Delete note"}
                          onClick={() => void remove(note.id)}
                          onBlur={() => setConfirmDelete(null)}
                        >
                          <IconTrash size={12} />
                        </ActionIcon>
                      </Tooltip>
                    </div>
                  )}
                </div>

                {editing?.id === note.id ? (
                  <>
                    <Textarea
                      aria-label="Edit log entry"
                      value={editing.content}
                      onChange={(e) => setEditing({ ...editing, content: e.currentTarget.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditing(null);
                        else submitOnEnter(() => void saveEdit())(e);
                      }}
                      autosize
                      minRows={2}
                      autoFocus
                    />
                    <div className={classes.composerRow} style={{ marginTop: 6 }}>
                      <label className={classes.visibility}>
                        <Switch
                          size="xs"
                          checked={!editing.dmOnly}
                          onChange={(e) => setEditing({ ...editing, dmOnly: !e.currentTarget.checked })}
                          classNames={switchClasses}
                        />
                        {editing.dmOnly ? "DM only" : "Players can see"}
                      </label>
                      <div style={{ display: "flex", gap: 4 }}>
                        <ActionIcon variant="subtle" color="gray" aria-label="Cancel edit" onClick={() => setEditing(null)}>
                          <IconX size={14} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="neon" aria-label="Save note" onClick={() => void saveEdit()}>
                          <IconCheck size={14} />
                        </ActionIcon>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={classes.noteBody}>
                    <Suspense fallback={<Loader size="xs" />}>
                      <MarkdownRenderer content={note.content} textColor="var(--cyber-fg)" />
                    </Suspense>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}
