import { useEffect, useRef, useState } from "react";
import { useMusicStore } from "@store/music/musicStore";
import { musicFetch } from "@services/musicService";
import { MAX_MB, message, useMusicCampaign } from "./lib";
import { ErrorLine } from "./shared";
import { Icon } from "./icons";

const BITRATES = [320, 256, 192, 128];
const HEALTH_MS = 15_000;
const STAGES: Record<string, string> = {
  metadata: "Reading the details",
  matching: "Finding it on YouTube Music",
  downloading: "Downloading",
  converting: "Converting",
  tagging: "Tagging",
  saving: "Adding to the library",
};

type Row = {
  key: string;
  id: string;
  bitrate: number;
  title: string;
  artist: string;
  state: "waiting" | "working" | "done" | "failed" | "unmatched";
  stage: string;
  progress: number | null;
  error?: string;
  pick?: string;
};

type Found = { video_id: string; title: string; artists: string[]; duration_s: number | null; kind: string };
type HelperEvent = { stage?: string; progress?: number | null; title?: string; artists?: string[]; done?: boolean; error?: string; notFound?: boolean };

async function* events(res: Response) {
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop()!;
    for (const line of lines) if (line) yield JSON.parse(line) as HelperEvent;
  }
}

const unreachable = (err: unknown) => (err instanceof TypeError ? "Could not reach the server. Check the connection and try again." : message(err));

async function readJson(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || body.message || "The server could not do that.");
  return body;
}

const length = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Picker({ start, onPick }: { start: string; onPick: (videoId: string) => void }) {
  const cid = useMusicCampaign();
  const [query, setQuery] = useState(start);
  const [results, setResults] = useState<Found[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const q = query.trim();
    const stale = new AbortController();
    const t = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setStatus("");
        return;
      }
      setStatus("Searching…");
      try {
        const found = await readJson(await musicFetch(cid, "search", { query: q }, stale.signal));
        setResults(found.results);
        setStatus(found.results.length ? "" : "Nothing found. Try another spelling.");
      } catch (err) {
        if (!stale.signal.aborted) setStatus(unreachable(err));
      }
    }, 300);
    return () => {
      clearTimeout(t);
      stale.abort();
    };
  }, [query, cid]);

  return (
    <div className="sb-fetch-picker">
      <label className="sb-field">
        <span className="sb-eyebrow">Search YouTube Music</span>
        <input className="sb-input" value={query} onChange={(e) => setQuery(e.target.value)} spellCheck={false} />
      </label>
      <p className="sb-hint" role="status">
        {status || "No confident match. It may have a different name on YouTube Music: choose the right song."}
      </p>
      {results.length > 0 && (
        <ul className="sb-fetch-found">
          {results.map((r) => (
            <li key={r.video_id}>
              <button type="button" onClick={() => onPick(r.video_id)}>
                <span className="sb-fetch-what">
                  <b>{r.title}</b>
                  {r.artists.length > 0 && <span>{r.artists.join(", ")}</span>}
                </span>
                <span className="sb-fetch-stage">
                  {r.kind}
                  {r.duration_s ? ` · ${length(r.duration_s)}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FetchTab({ active, onOpenLibrary }: { active: boolean; onOpenLibrary?: () => void }) {
  const cid = useMusicCampaign();
  const loadLibrary = useMusicStore((s) => s.loadLibrary);
  const [helper, setHelper] = useState<{ ffmpeg: boolean } | null | undefined>(undefined);
  const [link, setLink] = useState("");
  const [bitrate, setBitrate] = useState(320);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const rowsRef = useRef<Row[]>([]);
  const running = useRef(false);

  const put = (next: Row[]) => {
    rowsRef.current = next;
    setRows(next);
  };
  const patch = (key: string, change: Partial<Row>) => put(rowsRef.current.map((r) => (r.key === key ? { ...r, ...change } : r)));

  useEffect(() => {
    if (!active) return;
    let stop = false;
    const ask = async () => {
      try {
        const health = await readJson(await musicFetch(cid, "health"));
        if (!stop) setHelper(health.available ? health : null);
      } catch {
        if (!stop) setHelper(null);
      }
    };
    void ask();
    const t = setInterval(ask, HEALTH_MS);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [active, cid]);

  const fetchOne = async (row: Row) => {
    patch(row.key, { state: "working", stage: STAGES.metadata, progress: null, error: undefined });
    try {
      const res = await musicFetch(cid, "track", { id: row.id, bitrate: row.bitrate, pick: row.pick });
      if (!res.ok) await readJson(res);
      let stored = false;
      for await (const e of events(res)) {
        if (e.error) throw new Error(e.error);
        if (e.notFound) return patch(row.key, { state: "unmatched", stage: "No confident match", progress: null });
        if (e.done) stored = true;
        else if (e.stage && STAGES[e.stage]) {
          patch(row.key, {
            stage: STAGES[e.stage],
            progress: e.progress ?? null,
            ...(e.title && { title: e.title }),
            ...(e.artists && { artist: e.artists.join(", ") }),
          });
        }
      }
      if (!stored) throw new Error("The server stopped before the song was ready.");
      patch(row.key, { state: "done", stage: "In Unsorted", progress: 1 });
      void loadLibrary().catch(() => {});
    } catch (err) {
      patch(row.key, { state: "failed", stage: "Failed", progress: null, error: unreachable(err) });
    }
  };

  const work = async () => {
    if (running.current) return;
    running.current = true;
    try {
      for (let next; (next = rowsRef.current.find((r) => r.state === "waiting")); ) await fetchOne(next);
    } finally {
      running.current = false;
    }
  };

  const add = async () => {
    setError(null);
    setAdding(true);
    try {
      const found = await readJson(await musicFetch(cid, "resolve", { url: link.trim() }));
      const stamp = Date.now();
      const added = (found.tracks as { id: string; title: string | null; artists: string[] }[]).map(
        (t, i): Row => ({ key: `${stamp}-${i}`, id: t.id, bitrate, title: t.title ?? "A song", artist: t.artists.join(", "), state: "waiting", stage: "Waiting", progress: null }),
      );
      put([...rowsRef.current, ...added]);
      setLink("");
      void work();
    } catch (err) {
      setError(unreachable(err));
    } finally {
      setAdding(false);
    }
  };

  const waiting = rows.filter((r) => r.state === "waiting").length;
  const finished = rows.filter((r) => r.state === "done" || r.state === "failed").length;

  return (
    <div className="sb-tab">
      <section className="sb-panel sb-fetch">
        {helper ? (
          <p className="sb-fetch-status is-on">
            <span className="sb-dot" aria-hidden="true" />
            {helper.ffmpeg ? "SpotFetcher is ready on the server." : "SpotFetcher is running on the server, but it cannot find ffmpeg."}
          </p>
        ) : (
          <p className="sb-fetch-status">
            <span className="sb-dot" aria-hidden="true" />
            {helper === undefined ? "Checking SpotFetcher on the server…" : "SpotFetcher is not running on the server right now. It restarts by itself; try again in a minute."}
          </p>
        )}
        <form
          className="sb-fetch-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (link.trim()) void add();
          }}
        >
          <label className="sb-field">
            <span className="sb-eyebrow">Spotify link</span>
            <input className="sb-input is-tall" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://open.spotify.com/…" disabled={!helper} />
          </label>
          <label className="sb-field">
            <span className="sb-eyebrow">Quality</span>
            <select className="sb-input is-tall" value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))}>
              {BITRATES.map((b) => (
                <option key={b} value={b}>
                  {b} kbps
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="sb-btn is-gold is-tall" disabled={!helper || adding || !link.trim()}>
            {adding ? "Reading the link…" : <><Icon name="sparkle" /> Fetch</>}
          </button>
        </form>
        <p className="sb-hint">A song too long for the {MAX_MB} MB limit at this quality comes down at the highest quality that fits.</p>
        <ErrorLine error={error} />
      </section>

      {rows.length > 0 && (
        <section className="sb-panel sb-fetch">
          <div className="sb-fetch-head">
            <h2 className="sb-heading is-ink">
              The summoning · {rows.length} {rows.length === 1 ? "song" : "songs"}
            </h2>
            <span className="sb-spacer" />
            {onOpenLibrary && (
              <button type="button" className="sb-btn" onClick={onOpenLibrary}>
                Sort them on the Music tab
              </button>
            )}
            {waiting > 0 && (
              <button type="button" className="sb-btn" onClick={() => put(rowsRef.current.filter((r) => r.state !== "waiting"))}>
                Stop after this song
              </button>
            )}
            {finished > 0 && (
              <button type="button" className="sb-btn" onClick={() => put(rowsRef.current.filter((r) => r.state !== "done" && r.state !== "failed"))}>
                Clear the finished
              </button>
            )}
          </div>
          <ol className="sb-fetch-rows" aria-label="Songs being fetched">
            {rows.map((r) => (
              <li key={r.key} className={`sb-fetch-row is-${r.state}`}>
                <span className="sb-fetch-what">
                  <b>{r.title}</b>
                  {r.artist && <span>{r.artist}</span>}
                </span>
                <span className="sb-progress" aria-hidden="true">
                  <span style={{ transform: `scaleX(${r.progress ?? 0})` }} />
                </span>
                {r.state === "failed" ? (
                  <button
                    type="button"
                    className="sb-btn"
                    onClick={() => {
                      patch(r.key, { state: "waiting", stage: "Waiting", error: undefined, pick: undefined });
                      void work();
                    }}
                  >
                    Try again
                  </button>
                ) : r.state === "unmatched" ? (
                  <button type="button" className="sb-btn" onClick={() => put(rowsRef.current.filter((x) => x.key !== r.key))}>
                    Skip this song
                  </button>
                ) : (
                  <span className="sb-fetch-stage" role="status">
                    {r.stage}
                  </span>
                )}
                {r.error && <p className="sb-error">{r.error}</p>}
                {r.state === "unmatched" && (
                  <Picker
                    start={`${r.artist} ${r.title}`.trim()}
                    onPick={(videoId) => {
                      patch(r.key, { state: "waiting", stage: "Waiting", pick: videoId });
                      void work();
                    }}
                  />
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
