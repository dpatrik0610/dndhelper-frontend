import { useMemo } from "react";
import {
  IconChevronRight,
  IconEye,
  IconFlag,
  IconFolder,
  IconLock,
  IconPencil,
  IconPin,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import {
  CHRONICLE_CATEGORY_COLORS,
  CHRONICLE_CATEGORY_LABELS,
  CHRONICLE_FLAG_COLORS,
  type ChronicleEntry,
  type ChronicleFolder,
} from "@appTypes/Chronicle";
import type { CampaignMemberView } from "@appTypes/Campaign";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { timeAgo } from "@utils/timeAgo";
import {
  toMarkdown,
  type TitleIndex,
} from "@features/chronicle/chronicleLinks";
import { folderPath, sharingFolder } from "@features/chronicle/folderTree";
import classes from "@features/chronicle/Chronicle.module.css";

interface EntryViewProps {
  entry: ChronicleEntry;
  index: TitleIndex<ChronicleEntry>;
  folders: ChronicleFolder[];
  players: CampaignMemberView[];
  isDm: boolean;
  onLink: (href: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const badge = (color: string) => ({ ["--badge-color" as string]: color });

export function EntryView({
  entry,
  index,
  folders,
  players,
  isDm,
  onLink,
  onEdit,
  onDelete,
}: EntryViewProps) {
  const markdown = useMemo(
    () => toMarkdown(entry.content, index, isDm),
    [entry.content, index, isDm],
  );
  const crumbs = entry.folderId
    ? folderPath(entry.folderId, folders).split(" / ").filter(Boolean)
    : [];
  const names = (ids: string[]) =>
    players.filter((p) => ids.includes(p.userId)).map((p) => p.username);
  const via = sharingFolder(entry.folderId, folders);
  const updated = entry.updatedAt
    ? `Updated ${timeAgo(entry.updatedAt)}`
    : "Just written";

  return (
    <article className={classes.sheet}>
      {crumbs.length > 0 && (
        <nav className={classes.crumbs} aria-label="Folder">
          {crumbs.map((name, i) => (
            <span
              key={`${name}-${i}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              {i > 0 && <IconChevronRight size={11} />}
              {name}
            </span>
          ))}
        </nav>
      )}

      <header className={classes.folioHead}>
        <h1 className={classes.folioTitle}>{entry.title}</h1>
        {isDm && (
          <div className={classes.folioActions}>
            <button
              type="button"
              className={`glass-btn-secondary ${classes.button}`}
              onClick={onEdit}
            >
              <IconPencil size={14} /> Edit
            </button>
            <button
              type="button"
              className={classes.iconButton}
              onClick={onDelete}
              aria-label="Delete entry"
              title="Delete entry"
            >
              <IconTrash size={16} />
            </button>
          </div>
        )}
      </header>

      <div className={classes.meta}>
        <span
          className={classes.badge}
          style={badge(CHRONICLE_CATEGORY_COLORS[entry.category])}
        >
          {CHRONICLE_CATEGORY_LABELS[entry.category]}
        </span>
        {isDm && (
          <VisibilityBadge
            entry={entry}
            sharedNames={names(entry.sharedWith)}
            via={via}
            viaNames={via ? names(via.sharedWith) : []}
          />
        )}
        {entry.flag !== "None" && (
          <span
            className={classes.badge}
            style={badge(CHRONICLE_FLAG_COLORS[entry.flag])}
          >
            <IconFlag size={11} /> {entry.flag}
          </span>
        )}
        {entry.pinned && (
          <span
            className={classes.badge}
            style={badge("var(--theme-color-accent-primary, #f59e0b)")}
          >
            <IconPin size={11} /> Pinned
          </span>
        )}
        {entry.tags.map((t) => (
          <span key={t} className={classes.tag}>
            #{t}
          </span>
        ))}
      </div>

      <div className={classes.page}>
        {entry.content.trim() ? (
          <div data-chronicle-content>
            <MarkdownRenderer
              className={classes.content}
              textColor="inherit"
              content={markdown}
              onInternalLink={onLink}
            />
          </div>
        ) : (
          <p className={classes.emptyText}>
            {isDm
              ? "This page is blank. Choose Edit to start writing."
              : "This entry has no text yet."}
          </p>
        )}
        <footer className={classes.pageEnd}>
          <span className={classes.fleuron} aria-hidden>
            <span className={classes.fleuronMark} />
          </span>
          <p className={classes.byline}>
            {updated}
            {entry.createdBy ? `, written by ${entry.createdBy}` : ""}
          </p>
        </footer>
      </div>
    </article>
  );
}

function VisibilityBadge({
  entry,
  sharedNames,
  via,
  viaNames,
}: {
  entry: ChronicleEntry;
  sharedNames: string[];
  via: ChronicleFolder | null;
  viaNames: string[];
}) {
  const who = (names: string[]) =>
    names.length ? names.join(", ") : "No players picked";
  return (
    <>
      {entry.visibility === "All" && (
        <span className={classes.badge} style={badge("#22c55e")}>
          <IconEye size={11} /> All players
        </span>
      )}
      {entry.visibility === "Selected" && (
        <span
          className={classes.badge}
          style={badge("#38bdf8")}
          title={sharedNames.join(", ")}
        >
          <IconUsers size={11} /> {who(sharedNames)}
        </span>
      )}
      {via && (
        <span
          className={classes.badge}
          style={badge(via.visibility === "All" ? "#22c55e" : "#38bdf8")}
          title={`Shared through the ${via.name} folder`}
        >
          <IconFolder size={11} />{" "}
          {via.visibility === "All" ? "All players" : who(viaNames)}, via{" "}
          {via.name}
        </span>
      )}
      {entry.visibility === "Private" && !via && (
        <span className={classes.badge} style={badge("#94a3b8")}>
          <IconLock size={11} /> Only DMs
        </span>
      )}
    </>
  );
}
