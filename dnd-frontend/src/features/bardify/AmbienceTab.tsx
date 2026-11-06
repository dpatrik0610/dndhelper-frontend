import { useRef, useState } from "react";
import type { LibraryLayer, MusicLibrary } from "@appTypes/Music";
import { useMusicStore } from "@store/music/musicStore";
import { library, uploadWithProgress } from "@services/musicService";
import { UploadList } from "./MusicTab";
import { ACCEPT, isAudio, MAX_MB, titleFrom, useLibraryRunner, useMusicCampaign, type Upload } from "./lib";
import { useReorder } from "./reorder";
import { Icon, Sigil } from "./icons";
import { ErrorLine, Toggle } from "./shared";

export default function AmbienceTab({ lib }: { lib: MusicLibrary }) {
  const cid = useMusicCampaign();
  const loadLibrary = useMusicStore((s) => s.loadLibrary);
  const { busy, error, act, setError } = useLibraryRunner();
  const [pick, setPick] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);

  const fallback = lib.situations.find((s) => s.id === lib.ambience)?.id ?? lib.situations[0]?.id ?? null;
  const chosen = pick && lib.situations.some((s) => s.id === pick) ? pick : fallback;
  const open = lib.situations.find((s) => s.id === chosen) ?? null;

  const addSituation = async (name: string) => {
    let made: string | null = null;
    const ok = await act(async () => {
      made = (await library.createSituation(cid, name)).id;
    });
    if (ok && made) {
      setPick(made);
      setNewName("");
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!files.length || !open) return;
    setError(null);
    const queued = files.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, progress: 0 }));
    setUploads((u) => [...u, ...queued]);
    const problems: string[] = [];
    for (const [i, file] of files.entries()) {
      const key = queued[i].key;
      try {
        if (file.size > MAX_MB * 1024 * 1024) throw new Error(`“${file.name}” is over ${MAX_MB} MB.`);
        const form = new FormData();
        form.append("file", file, file.name);
        form.append("name", titleFrom(file.name) || file.name);
        await uploadWithProgress(cid, `collections/${open.id}/layers`, form, (p) => setUploads((u) => u.map((x) => (x.key === key ? { ...x, progress: p } : x))));
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
      <ErrorLine error={error} />
      <section className="sb-library">
        <nav className="sb-rail" aria-label="Situations">
          <h2 className="sb-heading">Situations</h2>
          <ol className="sb-cards">
            {lib.situations.map((s) => {
              const current = chosen === s.id;
              const sounding = s.id === lib.ambience;
              return (
                <li key={s.id} {...(current ? {} : { "data-drop": s.id })}>
                  <button type="button" className={`sb-card is-teal ${current ? "is-current" : ""}`} aria-current={current ? "true" : undefined} onClick={() => setPick(s.id)}>
                    <span className="sb-sigil">
                      <Sigil name={s.name} />
                    </span>
                    <span className="sb-card-name">{s.name}</span>
                    {sounding ? (
                      <span className="sb-card-meta is-teal">
                        <span className="sb-dot" /> Sounding
                      </span>
                    ) : (
                      <span className="sb-card-meta">{s.layers.length ? `${s.layers.length} ${s.layers.length === 1 ? "layer" : "layers"}` : "No layers"}</span>
                    )}
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
        </nav>

        {open ? (
          <AmbienceEditor
            key={open.id}
            title={open.name}
            id={open.id}
            layers={open.layers}
            sounding={open.id === lib.ambience}
            othersSounding={!!lib.ambience && open.id !== lib.ambience}
            uploads={uploads}
            onUpload={uploadFiles}
          />
        ) : (
          <div className="sb-panel sb-editor">
            <div className="sb-drop">
              <Icon name="sparkle" size={22} />
              <span>Add a situation first; its ambience layers live alongside its songs.</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function AmbienceEditor(props: { title: string; id: string; layers: LibraryLayer[]; sounding: boolean; othersSounding: boolean; uploads: Upload[]; onUpload: (files: File[]) => void }) {
  const { title, id, layers, sounding, othersSounding, uploads, onUpload } = props;
  const cid = useMusicCampaign();
  const { busy, error, act } = useLibraryRunner();
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const order = useReorder(
    layers,
    (l) => l.id,
    (ids) => act(() => library.reorderLayers(cid, id, ids)),
    (layer, target) => void act(() => library.moveLayer(cid, layer, target)),
  );
  const on = layers.filter((l) => l.on).length;

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
      <header className="sb-amb-head">
        <span className={`sb-ripple ${sounding ? "is-on" : ""}`} aria-hidden="true">
          <i />
          <i />
          <i />
          <b />
        </span>
        <div className="sb-editor-what">
          <span className={`sb-eyebrow ${sounding ? "is-teal" : ""}`}>{sounding ? "Sounding now · heard by everyone" : "Situation"}</span>
          <h2 className="sb-editor-title">{title}</h2>
          <span className="sb-meta">
            {layers.length ? `${layers.length} ${layers.length === 1 ? "layer" : "layers"}, ${on} switched on.` : "No layers yet."}
            {sounding && " Changes here are heard at once."}
          </span>
        </div>
        <div className="sb-actions">
          {sounding ? (
            <button type="button" className="sb-btn is-teal" disabled={busy} onClick={() => act(() => library.playAmbience(cid, null))}>
              <Icon name="stop" size={14} /> Stop the ambience
            </button>
          ) : (
            <button type="button" className="sb-btn is-teal" disabled={busy || !on} onClick={() => act(() => library.playAmbience(cid, id))}>
              <Icon name="play" size={16} /> {othersSounding ? "Sound this instead" : "Sound this ambience"}
            </button>
          )}
          <button type="button" className="sb-btn" onClick={() => fileInput.current?.click()}>
            <Icon name="upload" size={16} /> Upload layers
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
      <ErrorLine error={error} />
      <UploadList uploads={uploads} />

      {layers.length > 0 && (
        <ol className="sb-layers" ref={order.listRef}>
          {order.ordered.map((l, i) => (
            <LayerRow key={l.id} layer={l} grip={order.handle(l.id)} rowProps={order.row(l.id, i)} />
          ))}
        </ol>
      )}

      <div className="sb-drop is-teal">
        <Icon name="sparkle" size={22} />
        <span>Drop sound files here, up to {MAX_MB} MB each. Each loops for as long as it sounds; Ogg, WAV or FLAC loop without a seam, an MP3 leaves a short gap.</span>
      </div>
    </section>
  );
}

function LayerRow({ layer, grip, rowProps }: { layer: LibraryLayer; grip: ReturnType<ReturnType<typeof useReorder>["handle"]>; rowProps: ReturnType<ReturnType<typeof useReorder>["row"]> }) {
  const cid = useMusicCampaign();
  const { busy, error, act } = useLibraryRunner();
  const [name, setName] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [sliding, setSliding] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const level = sliding ?? layer.level;

  const slide = (value: number) => {
    setSliding(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await act(() => library.setLayer(cid, layer.id, { level: value }));
      setSliding((s) => (s === value ? null : s));
    }, 200);
  };

  const saveName = async () => {
    if (name === null) return;
    if (name.trim() === layer.name || (await act(() => library.renameLayer(cid, layer.id, name)))) setName(null);
  };

  return (
    <li {...rowProps} className={`sb-layer ${layer.on ? "is-on" : ""} ${rowProps.className}`}>
      <span className="sb-sigil sb-layer-grip" title="Drag to reorder, or onto another situation" {...grip}>
        <Icon name="waves" size={20} />
      </span>
      {name === null ? (
        <button type="button" className="sb-layer-name" onClick={() => setName(layer.name)} title="Rename">
          {layer.name}
        </button>
      ) : (
        <form
          className="sb-song-edit sb-layer-name"
          onSubmit={(e) => {
            e.preventDefault();
            void saveName();
          }}
          onKeyDown={(e) => e.key === "Escape" && setName(null)}
        >
          <input className="sb-input" value={name} autoFocus maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Layer name" />
          <button type="submit" className="sb-btn is-teal" disabled={busy}>
            Save
          </button>
          <button type="button" className="sb-btn" onClick={() => setName(null)}>
            Cancel
          </button>
        </form>
      )}
      <label className="sb-range is-teal sb-layer-level">
        <span className="sb-range-head">
          Level <b>{layer.on ? Math.round(level * 100) : "Off"}</b>
        </span>
        <input type="range" min={0} max={1} step={0.05} value={level} disabled={!layer.on} onChange={(e) => slide(Number(e.target.value))} aria-label={`${layer.name} level`} />
      </label>
      <span className="sb-layer-tools">
        <Toggle tone="teal" checked={layer.on} disabled={busy} onChange={() => act(() => library.setLayer(cid, layer.id, { on: !layer.on }))} label={`${layer.name} on`} />
        {asking ? (
          <span className="sb-confirm">
            <button type="button" className="sb-btn is-danger-solid" onClick={() => act(() => library.deleteLayer(cid, layer.id))} disabled={busy}>
              Delete
            </button>
            <button type="button" className="sb-btn" onClick={() => setAsking(false)}>
              Keep
            </button>
          </span>
        ) : (
          <button type="button" className="sb-icon-btn" onClick={() => setAsking(true)} aria-label={`Delete ${layer.name}`} title="Delete">
            <Icon name="trash" />
          </button>
        )}
      </span>
      {error && <span className="sb-error sb-song-error">{error}</span>}
    </li>
  );
}
