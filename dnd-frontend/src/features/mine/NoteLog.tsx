import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { notes as read, subscribe } from "./notes";
import styles from "./Mine.module.css";

export function NoteLog() {
  const notes = useSyncExternalStore(subscribe, read);
  return (
    <div className={styles.notes} aria-live="polite">
      {notes.map((n) => (
        <div
          key={n.id}
          className={styles.note}
          data-icon={n.icon ? "" : undefined}
          style={{ "--note-c": n.color, "--note-ms": `${n.ms}ms` } as CSSProperties}
        >
          {n.icon && <span className={styles.achIcon}>{n.icon}</span>}
          <div>
            {n.title && <strong>{n.title}</strong>}
            {n.text && <span>{n.text}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
