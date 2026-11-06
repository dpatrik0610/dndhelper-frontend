import { useRef, useState } from "react";
import type { LibrarySong, MusicLibrary, MusicState } from "@appTypes/Music";
import { useMusicStore } from "@store/music/musicStore";
import { library, music } from "@services/musicService";
import { useReorder } from "./reorder";
import { ConfirmButton, ErrorLine, Toggle } from "./shared";
import { ACCEPT, isAudio, MAX_MB, useAddFile, useLibraryRunner, useMusicCampaign, type Upload } from "./lib";
import { Bars, Icon, Sigil } from "./icons";
import NowPlaying from "./NowPlaying";
import { clock } from "./sync";
import { shrink } from "./tags";

type Grip = ReturnType<ReturnType<typeof useReorder>["handle"]>;
type RowProps = ReturnType<ReturnType<typeof useReorder>["row"]>;
type Choice = { kind: "situation"; id: string } | { kind: "inbox" };

const SUGGESTIONS = ["On the road", "Battle", "Tavern"];

export default function MusicTab({ lib }: { lib: MusicLibrary }) {
  const cid = useMusicCampaign();
  const player = useMusicStore((s) => s.state);
  const loadLibrary = useMusicStore((s) => s.loadLibrary);
  const addFile = useAddFile();
  const { busy, error, act, setError } = useLibraryRunner();
  const [pick, setPick] = useState<Choice | null>(null);
  const [newName, setNewName] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const situationOrder = useReorder(lib.situations, (s) => s.id, (ids) => act(() => library.reorderSituations(cid, ids)));

  const fallback: Choice = !lib.inbox.songs.length && lib.situations[0] ? { kind: "situation", id: lib.situations[0].id } : { kind: "inbox" };
  const chosen: Choice = pick && (pick.kind === "inbox" || lib.situations.some((s) => s.id === pick.id)) ? pick : fallback;
  const situation = chosen.kind === "situation" ? lib.situations.find((s) => s.id === chosen.id) : undefined;
  const open = situation ?? lib.inbox;
  const playingId = player?.track?.id ?? null;
  const playingFrom = player?.track ? player.track.collection : null;

  const addSituation = async (name: string) => {
    let made: string | null = null;
    const ok = await act(async () => {
      made = (await library.createSituation(cid, name)).id;
    });
    if (ok && made) {
      setPick({ kind: "situation", id: made });
      setNewName("");
    }
  };

  const moveTargets = [{ key: "", label: lib.inbox.name }, ...lib.situations.map((s) => ({ key: s.id, label: s.name }))];
  const moveSong = (song: string, target: string) => act(() => library.moveTrack(cid, song, target === "inbox" ? "" : target));
  const openKey = situation?.id ?? "";
  const dropAt = (key: string) => (key === openKey ? {} : { "data-drop": key || "inbox" });

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setError(null);
    const queued = files.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, progress: 0 }));
    setUploads((u) => [...u, ...queued]);
    const problems: string[] = [];
    for (const [i, file] of files.entries()) {
      const key = queued[i].key;
      try {
        await addFile(situation?.id ?? null, file, (p) => setUploads((u) => u.map((x) => (x.key === key ? { ...x, progress: p } : x))));
      } catch (err) {
        problems.push(err instanceof Error ? err.message : String(err));
      }
      setUploads((u) => u.filter((x) => x.key !== key));
    }
    await loadLibrary().catch(() => {});
    if (problems.length) setError(problems.join(" "));
  };

  return (
    <div className="sb-tab">
      <NowPlaying />
      <ErrorLine error={error} />

      <section className="sb-library" aria-label="Library">
        <nav className="sb-rail" aria-label="Situations">
          <h2 className="sb-heading">Situations</h2>
          <ol className="sb-cards">
            <li {...dropAt("")}>
              <button type="button" className={`sb-card is-inbox ${!situation ? "is-current" : ""}`} aria-current={!situation ? "true" : undefined} onClick={() => setPick({ kind: "inbox" })}>
                <span className="sb-sigil">
                  <Icon name="inbox" />
                </span>
                <span className="sb-card-name">{lib.inbox.name}</span>
                <span className="sb-card-meta">{lib.inbox.songs.length ? `${lib.inbox.songs.length} new` : "Empty"}</span>
              </button>
            </li>
          </ol>
          <ol ref={situationOrder.listRef} className="sb-cards">
            {situationOrder.ordered.map((s, i) => {
              const r = situationOrder.row(s.id, i);
              const current = situation?.id === s.id;
              const playing = playingFrom === s.name;
              return (
                <li key={s.id} {...r} {...dropAt(s.id)} className={`sb-card-row ${r.className}`}>
                  <span className="sb-grip is-card" title="Drag to reorder" aria-hidden="true" {...situationOrder.handle(s.id)}>
                    ⠿
                  </span>
                  <button type="button" className={`sb-card ${current ? "is-current" : ""}`} aria-current={current ? "true" : undefined} onClick={() => setPick({ kind: "situation", id: s.id })}>
                    <span className="sb-sigil">
                      <Sigil name={s.name} />
                    </span>
                    <span className="sb-card-name">{s.name}</span>
                    <span className={`sb-card-meta ${playing ? "is-gold" : ""}`}>{playing ? `Playing · ${s.songs.length}` : s.songs.length}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <form
            className="sb-new"
            onSubmit={(e) => {
              e.preventDefault();
              if (newName.trim()) void addSituation(newName);
            }}
          >
            <input className="sb-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New situation…" aria-label="New situation" />
            <button type="submit" className="sb-btn" disabled={busy || !newName.trim()}>
              Add
            </button>
          </form>
          {lib.situations.length === 0 && (
            <div className="sb-suggest">
              {SUGGESTIONS.map((name) => (
                <button key={name} type="button" className="sb-btn is-quiet" disabled={busy} onClick={() => addSituation(name)}>
                  <Sigil name={name} size={16} /> {name}
                </button>
              ))}
            </div>
          )}
          <FadesPanel settings={lib.settings} />
        </nav>

        <CollectionEditor
          key={openKey || "inbox"}
          title={open.name}
          id={open.id}
          songs={open.songs}
          kind={chosen.kind}
          moveTargets={moveTargets.filter((t) => t.key !== openKey)}
          onMoveSong={moveSong}
          playingId={playingId}
          uploads={uploads}
          onUpload={uploadFiles}
          onDeleted={() => setPick({ kind: "inbox" })}
        />
      </section>
    </div>
  );
}

function CollectionEditor(props: {
  title: string;
  id: string | null;
  songs: LibrarySong[];
  kind: Choice["kind"];
  moveTargets: { key: string; label: string }[];
  onMoveSong: (song: string, target: string) => void;
  playingId: string | null;
  uploads: Upload[];
  onUpload: (files: File[]) => void;
  onDeleted: () => void;
}) {
  const { title, id, songs, kind, moveTargets, onMoveSong, playingId, uploads, onUpload, onDeleted } = props;
  const cid = useMusicCampaign();
  const receive = useMusicStore((s) => s.receive);
  const { busy, error, run, act } = useLibraryRunner();
  const play = (fn: () => Promise<MusicState>) => run(async () => receive(cid, await fn()));
  const reorder = (ids: string[]) => act(async () => id && library.reorderTracks(cid, id, ids));
  const songOrder = useReorder(songs, (s) => s.id, reorder, onMoveSong);
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const total = songs.reduce((t, s) => t + s.duration, 0);

  const nudge = (index: number, dir: -1 | 1) => {
    const ids = songs.map((s) => s.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + dir, 0, moved);
    return reorder(ids);
  };

  return (
    <section
      className={`sb-panel sb-editor ${dragging ? "is-dropping" : ""}`}
      aria-label={title}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onUpload([...e.dataTransfer.files].filter(isAudio));
      }}
    >
      <header className="sb-editor-head">
        <div className="sb-editor-what">
          <span className="sb-eyebrow">{kind === "inbox" ? "New songs" : "Situation"}</span>
          {kind === "situation" ? (
            <input className="sb-title-input" value={name ?? title} onChange={(e) => setName(e.target.value)} aria-label="Situation name" />
          ) : (
            <h2 className="sb-editor-title">{title}</h2>
          )}
          <span className="sb-meta">{songs.length ? `${songs.length} ${songs.length === 1 ? "song" : "songs"} · ${clock(total)}` : kind === "inbox" ? "Nothing waiting. Songs from SpotFetcher land here." : "No songs yet."}</span>
        </div>
        <div className="sb-actions">
          <button type="button" className="sb-btn is-gold" disabled={busy || !id || !songs.length} onClick={() => id && play(() => music.playCollection(cid, id))}>
            <Icon name="play" size={16} /> Play this collection
          </button>
          <button type="button" className="sb-btn" disabled={busy || !id || !songs.length} onClick={() => id && play(() => music.enqueue(cid, { collectionId: id }))}>
            Add all to the setlist
          </button>
          <button type="button" className="sb-btn" onClick={() => fileInput.current?.click()}>
            <Icon name="upload" size={16} /> Upload songs
          </button>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            onChange={(e) => {
              onUpload([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
        </div>
      </header>
      {name !== null && name !== title && (
        <div className="sb-inline-save">
          <button type="button" className="sb-btn is-gold" disabled={busy} onClick={async () => id && (await act(() => library.renameSituation(cid, id, name))) && setName(null)}>
            Save name
          </button>
          <button type="button" className="sb-btn" onClick={() => setName(null)} disabled={busy}>
            Discard
          </button>
        </div>
      )}
      <ErrorLine error={error} />
      <UploadList uploads={uploads} />

      {songs.length > 0 && (
        <ol className="sb-songs" ref={songOrder.listRef}>
          {songOrder.ordered.map((s, i) => (
            <SongRow
              key={s.id}
              song={s}
              no={i + 1}
              first={i === 0}
              last={i === songs.length - 1}
              playing={s.id === playingId}
              onPlay={() => play(() => music.playNow(cid, s.id))}
              onQueue={() => play(() => music.enqueue(cid, { songs: [s.id] }))}
              onNudge={(dir) => nudge(i, dir)}
              busy={busy}
              grip={songOrder.handle(s.id)}
              rowProps={songOrder.row(s.id, i)}
              moveTargets={moveTargets}
              onMove={(target) => onMoveSong(s.id, target || "inbox")}
            />
          ))}
        </ol>
      )}

      <div className="sb-drop">
        <Icon name="sparkle" size={22} />
        <span>
          {songs.length ? "Drop audio files here to add them." : "Drop audio files here, or use Upload songs."} MP3, Ogg, M4A, FLAC or WAV, up to {MAX_MB} MB each. Title, artist and cover come from
          the file’s tags.
        </span>
      </div>

      {kind === "situation" && id && (
        <footer className="sb-editor-foot">
          <ConfirmButton
            label="Delete this situation"
            confirm={songs.length ? `Delete it and its ${songs.length} ${songs.length === 1 ? "song" : "songs"}?` : "Delete it?"}
            busy={busy}
            onConfirm={async () => (await act(() => library.deleteSituation(cid, id))) && onDeleted()}
          />
        </footer>
      )}
    </section>
  );
}

export function UploadList({ uploads }: { uploads: Upload[] }) {
  if (!uploads.length) return null;
  return (
    <ul className="sb-uploads" aria-label="Uploading">
      {uploads.map((u) => (
        <li key={u.key}>
          <span className="sb-uploads-name">{u.name}</span>
          <span className="sb-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${u.progress})` }} />
          </span>
          <span className="sb-meta">{Math.round(u.progress * 100)}%</span>
        </li>
      ))}
    </ul>
  );
}

function SongRow(props: {
  song: LibrarySong;
  no: number;
  first: boolean;
  last: boolean;
  playing: boolean;
  onPlay: () => void;
  onQueue: () => void;
  onNudge: (dir: -1 | 1) => void;
  busy: boolean;
  grip: Grip;
  rowProps: RowProps;
  moveTargets: { key: string; label: string }[];
  onMove: (target: string) => void;
}) {
  const { song, no, first, last, playing, onPlay, onQueue, onNudge, busy, grip, rowProps, moveTargets, onMove } = props;
  const cid = useMusicCampaign();
  const coverInput = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const { busy: saving, error, act } = useLibraryRunner();
  const [edit, setEdit] = useState<{ title: string; artist: string } | null>(null);
  const [asking, setAsking] = useState(false);
  const closeMenu = () => menu.current?.removeAttribute("open");

  const changeCover = (file: File) =>
    act(async () => {
      const image = await shrink(file);
      if (!image) throw new Error("This browser could not read that image.");
      await library.setCover(cid, song.id, image);
    });

  const save = async () => {
    if (!edit) return;
    if (await act(() => library.updateTrack(cid, song.id, { title: edit.title, artist: edit.artist }))) setEdit(null);
  };

  return (
    <li {...rowProps} className={`sb-song ${playing ? "is-playing" : ""} ${rowProps.className}`}>
      <span className="sb-song-no" title="Drag to reorder, or onto another situation" {...grip}>
        <span className="sb-song-num">{playing ? <Bars playing /> : String(no).padStart(2, "0")}</span>
        <span className="sb-song-grip" aria-hidden="true">
          ⠿
        </span>
      </span>
      {edit === null ? (
        <button type="button" className="sb-song-what" onClick={() => setEdit({ title: song.title, artist: song.artist ?? "" })} title="Edit title and artist">
          <span className="sb-thumb">{song.cover ? <img src={song.cover} alt="" /> : <Icon name="note" />}</span>
          <span className="sb-song-text">
            <span className="sb-song-title">{song.title}</span>
            {song.artist && <span className="sb-song-artist">{song.artist}</span>}
          </span>
        </button>
      ) : (
        <form
          className="sb-song-edit"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          onKeyDown={(e) => e.key === "Escape" && setEdit(null)}
        >
          <input className="sb-input" value={edit.title} autoFocus onChange={(e) => setEdit({ ...edit, title: e.target.value })} aria-label="Title" placeholder="Title" />
          <input className="sb-input" value={edit.artist} onChange={(e) => setEdit({ ...edit, artist: e.target.value })} aria-label="Artist" placeholder="Artist" />
          <button type="submit" className="sb-btn is-gold" disabled={saving}>
            Save
          </button>
          <button type="button" className="sb-btn" onClick={() => setEdit(null)}>
            Cancel
          </button>
        </form>
      )}
      <span className="sb-song-len">{clock(song.duration)}</span>
      <span className="sb-song-tools">
        <button type="button" className="sb-icon-btn" onClick={onPlay} disabled={busy} aria-label={`Play ${song.title} now`} title="Play now">
          <Icon name="play" size={16} />
        </button>
        <button type="button" className="sb-icon-btn" onClick={onQueue} disabled={busy} aria-label={`Add ${song.title} to the setlist`} title="Add to the setlist">
          <Icon name="plus" />
        </button>
        <details ref={menu} className="sb-more">
          <summary className="sb-icon-btn" aria-label={`More for ${song.title}`} title="More">
            <Icon name="more" />
          </summary>
          <div className="sb-menu">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                closeMenu();
                coverInput.current?.click();
              }}
            >
              <Icon name="image" size={16} /> Change cover art
            </button>
            <label className="sb-menu-move">
              <Icon name="move" size={16} />
              <select
                aria-label={`Move ${song.title} to another collection`}
                value="-"
                disabled={saving}
                onChange={(e) => {
                  if (e.target.value === "-") return;
                  closeMenu();
                  onMove(e.target.value);
                }}
              >
                <option value="-">Move to…</option>
                {moveTargets.map((t) => (
                  <option key={t.key || "inbox"} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" disabled={first || saving} onClick={() => onNudge(-1)}>
              <Icon name="up" size={16} /> Move up
            </button>
            <button type="button" disabled={last || saving} onClick={() => onNudge(1)}>
              <Icon name="down" size={16} /> Move down
            </button>
            {asking ? (
              <span className="sb-confirm">
                <button type="button" className="sb-btn is-danger-solid" onClick={() => act(() => library.deleteTrack(cid, song.id))} disabled={saving}>
                  Delete
                </button>
                <button type="button" className="sb-btn" onClick={() => setAsking(false)}>
                  Keep
                </button>
              </span>
            ) : (
              <button type="button" className="is-danger" onClick={() => setAsking(true)}>
                <Icon name="trash" size={16} /> Delete
              </button>
            )}
          </div>
        </details>
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void changeCover(file);
          }}
        />
      </span>
      {error && <span className="sb-error sb-song-error">{error}</span>}
    </li>
  );
}

const EASINGS = [
  { id: "inOut", label: "In-out" },
  { id: "in", label: "In" },
  { id: "out", label: "Out" },
] as const;

function FadesPanel({ settings }: { settings: MusicLibrary["settings"] }) {
  const cid = useMusicCampaign();
  const receive = useMusicStore((s) => s.receive);
  const { busy, error, act } = useLibraryRunner();
  const [sliding, setSliding] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossfade = sliding ?? settings.crossfade;
  const save = (change: Parameters<typeof music.settings>[1]) => act(async () => receive(cid, await music.settings(cid, change)));

  const slide = (value: number) => {
    setSliding(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await save({ crossfade: value });
      setSliding((s) => (s === value ? null : s));
    }, 350);
  };

  return (
    <div className="sb-panel sb-fades">
      <h3 className="sb-heading">Fades</h3>
      <label className="sb-range">
        <span className="sb-range-head">
          Crossfade <b>{crossfade ? `${crossfade} s` : "Off"}</b>
        </span>
        <input type="range" min={0} max={12} step={0.5} value={crossfade} onChange={(e) => slide(Number(e.target.value))} />
      </label>
      <div className="sb-segment" role="group" aria-label="Fade shape">
        {EASINGS.map((e) => (
          <button key={e.id} type="button" className={settings.easing === e.id ? "is-on" : ""} aria-pressed={settings.easing === e.id} disabled={busy || !crossfade} onClick={() => save({ easing: e.id })}>
            {e.label}
          </button>
        ))}
      </div>
      <Toggle checked={settings.softPause} disabled={busy} onChange={() => save({ softPause: !settings.softPause })}>
        Fade gently on pause
      </Toggle>
      <p className="sb-hint">{crossfade ? "Each song rises under the last. iPhones can’t fade, so they cut." : "Songs cut straight from one to the next."}</p>
      <ErrorLine error={error} />
    </div>
  );
}
