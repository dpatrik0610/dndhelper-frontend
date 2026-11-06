import { useState } from "react";
import { IconCopy, IconDeviceFloppy, IconRestore } from "@tabler/icons-react";
import type {
  ChronicleEntry,
  ChronicleEntryInput,
  ChronicleFolder,
} from "@appTypes/Chronicle";
import { showNotification } from "@components/Notification/Notification";
import { useChronicleStore } from "@store/chronicle/chronicleStore";
import { toInput } from "@features/chronicle/chronicleUtils";
import classes from "@features/chronicle/Chronicle.module.css";

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

const copy = (text: string) =>
  void navigator.clipboard.writeText(text).then(
    () =>
      showNotification({
        title: "Copied",
        message: "The JSON is on your clipboard.",
        color: "green",
      }),
    () =>
      showNotification({
        title: "Could not copy",
        message: "The browser blocked clipboard access.",
        color: "red",
      }),
  );

export function JsonEntryPanel({ entry }: { entry: ChronicleEntry }) {
  const original = pretty(toInput(entry));
  const [text, setText] = useState(original);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    let input: ChronicleEntryInput;
    try {
      input = JSON.parse(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "This is not valid JSON.");
      return;
    }
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      setError("The JSON must be a single object.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const saved = await useChronicleStore
        .getState()
        .update(entry.id, { ...input, campaignId: entry.campaignId });
      setText(pretty(toInput(saved)));
      showNotification({
        title: "Saved",
        message: `${saved.title} was updated from JSON.`,
        color: "green",
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The server rejected this entry.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={classes.devPanel} aria-label="Entry JSON">
      <header className={classes.devHead}>
        <h2 className={classes.devTitle}>{entry.title}</h2>
        <span className={classes.devId}>{entry.id}</span>
      </header>
      <textarea
        className={classes.devText}
        aria-label="Editable entry JSON"
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            void save();
          }
        }}
      />
      {error && <p className={classes.devError}>{error}</p>}
      <div className={classes.devBar}>
        <span className={classes.hint}>
          Editable fields only. Ctrl+S saves.
        </span>
        <button
          type="button"
          className={`glass-btn-secondary ${classes.button}`}
          onClick={() => copy(text)}
        >
          <IconCopy size={14} /> Copy
        </button>
        <button
          type="button"
          className={`glass-btn-secondary ${classes.button}`}
          onClick={() => {
            setText(original);
            setError(null);
          }}
          disabled={text === original}
        >
          <IconRestore size={14} /> Reset
        </button>
        <button
          type="button"
          className={`glass-btn-primary ${classes.button}`}
          onClick={() => void save()}
          disabled={saving || text === original}
        >
          <IconDeviceFloppy size={14} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <details className={classes.devRaw}>
        <summary>Full record from the server</summary>
        <pre>{pretty(entry)}</pre>
      </details>
    </section>
  );
}

export function JsonDumpPanel({
  entries,
  folders,
}: {
  entries: ChronicleEntry[];
  folders: ChronicleFolder[];
}) {
  const dump = pretty({ folders, entries });
  return (
    <section className={classes.devPanel} aria-label="Chronicle JSON">
      <header className={classes.devHead}>
        <h2 className={classes.devTitle}>Whole Chronicle</h2>
        <span className={classes.devId}>
          {entries.length} entries, {folders.length} folders
        </span>
        <button
          type="button"
          className={`glass-btn-secondary ${classes.button}`}
          onClick={() => copy(dump)}
        >
          <IconCopy size={14} /> Copy
        </button>
      </header>
      <textarea
        className={classes.devText}
        aria-label="Chronicle JSON"
        readOnly
        spellCheck={false}
        value={dump}
      />
      <p className={classes.hint}>Open an entry to edit its JSON.</p>
    </section>
  );
}
