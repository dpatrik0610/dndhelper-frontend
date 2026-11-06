import { useEffect, useState } from "react";
import type { MusicState } from "@appTypes/Music";
import { music } from "@services/musicService";
import type { PlayerRun } from "./lib";
import { useReorder } from "./reorder";
import { Bars, Icon } from "./icons";
import { clock } from "./sync";

export default function Setlist({ s, cid, isDm, run, onClose }: { s: MusicState; cid: string; isDm: boolean; run: PlayerRun; onClose?: () => void }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const seen = new Map<string, number>();
  const rows = s.queue.map((q) => {
    const nth = seen.get(q.id) ?? 0;
    seen.set(q.id, nth + 1);
    return { ...q, rowId: `${q.id}#${nth}` };
  });
  const songAt = new Map(rows.map((q) => [q.rowId, q.id]));
  const order = useReorder(rows, (q) => q.rowId, (_, { id, from, to }) => run(() => music.moveQueued(cid, from, to, songAt.get(id)!)));
  const list = order.listRef;

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    list.current?.querySelector(".is-current")?.scrollIntoView({ block: "nearest" });
  }, [list, s.index]);

  const total = s.queue.reduce((t, q) => t + q.duration, 0);

  return (
    <section className={`sb-setlist ${onClose ? "is-floating" : "sb-panel"}`} aria-label="Setlist">
      <header className="sb-setlist-head">
        <div>
          <h2 className="sb-heading is-ink">Setlist</h2>
          <p className="sb-meta">
            {s.queue.length} {s.queue.length === 1 ? "song" : "songs"} · {clock(total)}
            {s.shuffle && " · shuffled"}
            {s.repeat === "all" && " · repeating"}
            {s.repeat === "one" && " · this song on repeat"}
          </p>
        </div>
        {isDm &&
          s.queue.length > 0 &&
          (confirmClear ? (
            <span className="sb-confirm">
              <button type="button" className="sb-btn is-danger-solid" onClick={() => run(() => music.clear(cid)).then(() => setConfirmClear(false))}>
                Clear
              </button>
              <button type="button" className="sb-btn" onClick={() => setConfirmClear(false)}>
                No
              </button>
            </span>
          ) : (
            <button type="button" className="sb-btn is-quiet" onClick={() => setConfirmClear(true)}>
              Clear
            </button>
          ))}
        {onClose && (
          <button type="button" className="sb-icon-btn" onClick={onClose} aria-label="Close the setlist">
            <Icon name="close" />
          </button>
        )}
      </header>
      {rows.length === 0 ? (
        <p className="sb-meta sb-setlist-empty">Nothing queued. Play a situation, or add songs with +.</p>
      ) : (
        <ol ref={list} className="sb-setlist-list">
          {order.ordered.map((q, i) => {
            const current = rows[s.index]?.rowId === q.rowId;
            const state = current ? "is-current" : i < s.index ? "is-played" : "";
            const r = order.row(q.rowId, i);
            const body = (
              <>
                <span className="sb-setlist-no">{current ? <Bars playing={s.playing} /> : String(i + 1).padStart(2, "0")}</span>
                <span className="sb-setlist-what">
                  <span className="sb-setlist-title">{q.title}</span>
                  <span className="sb-setlist-sub">{[q.artist, q.collection].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="sb-setlist-len">{clock(q.duration)}</span>
              </>
            );
            return (
              <li key={q.rowId} {...r} className={`sb-setlist-row ${state} ${r.className}`}>
                {isDm ? (
                  <>
                    <button type="button" className="sb-grip" aria-label={`Move ${q.title}. Use the up and down arrow keys, or drag.`} title="Drag to reorder" {...order.handle(q.rowId)}>
                      ⠿
                    </button>
                    <button type="button" className="sb-setlist-body" onClick={() => !current && run(() => music.jump(cid, i, q.id))} aria-current={current ? "true" : undefined}>
                      {body}
                    </button>
                    <button type="button" className="sb-icon-btn is-small" onClick={() => run(() => music.removeQueued(cid, i, q.id))} aria-label={`Take ${q.title} out of the setlist`}>
                      <Icon name="remove" size={16} />
                    </button>
                  </>
                ) : (
                  <div className="sb-setlist-body" aria-current={current ? "true" : undefined}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
