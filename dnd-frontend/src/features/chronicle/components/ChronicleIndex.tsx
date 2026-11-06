import { useMemo, type ReactNode } from "react";
import {
  IconClock,
  IconFlag,
  IconFolderPlus,
  IconPin,
  IconPlus,
} from "@tabler/icons-react";
import {
  CHRONICLE_CATEGORIES,
  CHRONICLE_CATEGORY_COLORS,
  CHRONICLE_CATEGORY_LABELS,
  CHRONICLE_FLAG_COLORS,
  type ChronicleEntry,
} from "@appTypes/Chronicle";
import { timeAgo } from "@utils/timeAgo";
import { useChronicleStore } from "@store/chronicle/chronicleStore";
import { isShared } from "@features/chronicle/chronicleUtils";
import classes from "@features/chronicle/Chronicle.module.css";

interface ChronicleIndexProps {
  entries: ChronicleEntry[];
  campaignName: string | null;
  isDm: boolean;
  onOpen: (id: string) => void;
  onNewEntry: () => void;
  onNewFolder: () => void;
}

const RECENT = 8;

/** The landing view: what the Chronicle holds, and the entries most likely needed next. */
export function ChronicleIndex({
  entries,
  campaignName,
  isDm,
  onOpen,
  onNewEntry,
  onNewFolder,
}: ChronicleIndexProps) {
  const counts = useMemo(
    () =>
      CHRONICLE_CATEGORIES.map((c) => ({
        c,
        n: entries.filter((e) => e.category === c).length,
      })).filter((x) => x.n > 0),
    [entries],
  );
  const recent = useMemo(
    () =>
      [...entries]
        .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
        .slice(0, RECENT),
    [entries],
  );
  const pinned = entries.filter((e) => e.pinned);
  const flagged = entries.filter((e) => e.flag !== "None" && e.flag !== "Done");
  const folders = useChronicleStore((s) => s.folders);
  const shared = entries.filter((e) => isShared(e, folders)).length;

  const item = (e: ChronicleEntry, trailing?: ReactNode) => (
    <button
      key={e.id}
      type="button"
      className={classes.indexItem}
      onClick={() => onOpen(e.id)}
    >
      <span
        className={classes.dot}
        style={{ background: CHRONICLE_CATEGORY_COLORS[e.category] }}
      />
      <span className={classes.rowLabel}>{e.title}</span>
      {trailing}
    </button>
  );

  const lead = isDm
    ? entries.length
      ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"}, ${shared} shared with players. Everything else stays between the DMs.`
      : "Write down places, people, plots and secrets. Link entries with [[Title]], sort them into folders and share the ones your players should read. New entries start private."
    : entries.length
      ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} your DM has shared with you. New ones appear here the moment they're shared.`
      : "Your DM hasn't shared anything yet. Entries appear here the moment they're shared with you.";

  return (
    <div className={classes.index}>
      <h1 className={classes.indexTitle}>{campaignName ?? "Chronicle"}</h1>
      <p className={classes.indexLead}>{lead}</p>

      {isDm && (
        <div className={classes.indexActions}>
          <button
            type="button"
            className={`glass-btn-primary ${classes.button}`}
            onClick={onNewEntry}
          >
            <IconPlus size={15} /> New entry
          </button>
          <button
            type="button"
            className={`glass-btn-secondary ${classes.button}`}
            onClick={onNewFolder}
          >
            <IconFolderPlus size={15} /> New folder
          </button>
        </div>
      )}

      {counts.length > 0 && (
        <>
          <div
            className={classes.spread}
            role="img"
            aria-label="Entries by category"
          >
            {counts.map(({ c, n }) => (
              <span
                key={c}
                style={{ flex: n, background: CHRONICLE_CATEGORY_COLORS[c] }}
              />
            ))}
          </div>
          <div className={classes.legend}>
            {counts.map(({ c, n }) => (
              <span key={c} className={classes.legendItem}>
                <span
                  className={classes.dot}
                  style={{ background: CHRONICLE_CATEGORY_COLORS[c] }}
                />
                {CHRONICLE_CATEGORY_LABELS[c]} {n}
              </span>
            ))}
          </div>
        </>
      )}

      {entries.length > 0 && (
        <div className={classes.indexGrid}>
          <section>
            <h2 className={classes.indexHeading}>
              <IconClock size={14} /> Recently updated
            </h2>
            {recent.map((e) =>
              item(
                e,
                <span className={classes.indexWhen}>
                  {e.updatedAt ? timeAgo(e.updatedAt) : ""}
                </span>,
              ),
            )}
          </section>

          {pinned.length > 0 && (
            <section>
              <h2 className={classes.indexHeading}>
                <IconPin size={14} /> Pinned
              </h2>
              {pinned.map((e) => item(e))}
            </section>
          )}

          {isDm && flagged.length > 0 && (
            <section>
              <h2 className={classes.indexHeading}>
                <IconFlag size={14} /> Needs attention
              </h2>
              {flagged.map((e) =>
                item(
                  e,
                  <span
                    className={classes.indexWhen}
                    style={{
                      color:
                        CHRONICLE_FLAG_COLORS[
                          e.flag as keyof typeof CHRONICLE_FLAG_COLORS
                        ],
                    }}
                  >
                    {e.flag}
                  </span>,
                ),
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
