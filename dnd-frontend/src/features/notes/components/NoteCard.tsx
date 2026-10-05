import { Suspense, lazy } from "react";
import { Loader, Menu, Spoiler, Tooltip } from "@mantine/core";
import { IconDotsVertical, IconDownload, IconPencil, IconPin, IconPinFilled, IconTrash } from "@tabler/icons-react";
import type { Note } from "@appTypes/Note";
import { downloadNote, noteBody, timeAgo } from "@features/notes/noteUtils";
import classes from "@features/notes/Notes.module.css";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

interface NoteCardProps {
  note: Note;
  /** The search text, highlighted in the title and body. */
  query: string;
  onOpen: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "gi")).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className={classes.mark}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function NoteCard({ note, query, onOpen, onTogglePin, onDelete }: NoteCardProps) {
  const title = note.title || "Untitled";
  const body = noteBody(note);
  const pinned = !!note.isFavorite;

  return (
    <article className={classes.card} data-pinned={pinned || undefined}>
      <header className={classes.cardHeader}>
        <div className={classes.cardHeading}>
          <button type="button" className={classes.cardTitle} onClick={onOpen}>
            {highlight(title, query)}
          </button>
          {note.updatedAt && (
            <p className={`${classes.cardMeta} ${classes.muted}`} title={new Date(note.updatedAt).toLocaleString()}>
              Updated {timeAgo(note.updatedAt)}
            </p>
          )}
        </div>

        <div className={classes.cardActions}>
          <Tooltip label={pinned ? "Unpin" : "Pin to top"}>
            <button type="button" className={classes.cardAction} onClick={onTogglePin} aria-pressed={pinned} aria-label={pinned ? `Unpin ${title}` : `Pin ${title}`}>
              {pinned ? <IconPinFilled size={16} /> : <IconPin size={16} />}
            </button>
          </Tooltip>
          <Tooltip label="Edit">
            <button type="button" className={classes.cardAction} onClick={onOpen} aria-label={`Edit ${title}`}>
              <IconPencil size={16} />
            </button>
          </Tooltip>
          <Menu position="bottom-end" withinPortal classNames={{ dropdown: "glassy-dropdown" }}>
            <Menu.Target>
              <button type="button" className={classes.cardAction} aria-label={`More actions for ${title}`}>
                <IconDotsVertical size={16} />
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => downloadNote(note)}>
                Download .md
              </Menu.Item>
              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </header>

      {body.trim() && (
        <div className={classes.cardBody}>
          <Spoiler maxHeight={220} showLabel="Show more" hideLabel="Show less" classNames={{ control: classes.more }}>
            <Suspense fallback={<Loader size="sm" />}>
              <MarkdownRenderer content={body} highlightQuery={query || undefined} textColor="var(--theme-color-text-primary, #fff)" />
            </Suspense>
          </Spoiler>
        </div>
      )}
    </article>
  );
}
