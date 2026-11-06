import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useCanDriveMusic } from "@store/campaign/campaignSelectors";
import { useMusicStore } from "@store/music/musicStore";
import { library, music, musicHeartbeat } from "@services/musicService";
import type { MusicState, SkipKind } from "@appTypes/Music";
import { useMusicCampaign, usePlayerRunner, useServerClock } from "./lib";
import { clamp01, EASE, gainOf, positionAt } from "./sync";
import { Bars, Disc, Icon } from "./icons";
import Setlist from "./Setlist";
import Staff from "./Staff";
import "./bardify.css";

type State = MusicState;

const RESULT_MS = 6000;
const QUIETEST = 0.05;
const SOFT_MS = 800;
const AMBIENCE_RAMP_S = 2.5;
const GAIN_TICK_MS = 50;
const STORAGE_KEY = "bardify";

type Prefs = { volume: number; muted: boolean; collapsed: boolean };
const DEFAULT_PREFS: Prefs = { volume: QUIETEST, muted: false, collapsed: false };
function readPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function MusicPlayer() {
  const cid = useMusicCampaign();
  const s = useMusicStore((st) => st.state);
  const setListening = useMusicStore((st) => st.setListening);
  const userId = useCurrentUserId() ?? "";
  const isDm = useCanDriveMusic();
  const serverNow = useServerClock(cid);
  const { run, error } = usePlayerRunner();

  const decks = useRef<(HTMLAudioElement | null)[]>([null, null]);
  const live = useRef(0);
  const loaded = useRef<(string | null)[]>([null, null]);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dock, setDock] = useState<HTMLElement | null>(null);
  const stateRef = useRef<State | null>(s);
  const lastSeek = useRef(0);
  const playPending = useRef(false);
  const fadeOut = useRef<{ deck: number; from: number } | null>(null);
  const fadeIn = useRef<{ url: string; from: number } | null>(null);
  const soft = useRef<{ dir: 1 | -1; from: number; start: number } | null>(null);
  const layers = useRef(new Map<string, { el: HTMLAudioElement; level: number; target: number }>());
  const lastTick = useRef(0);

  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const prefsRef = useRef(prefs);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [canSetVolume, setCanSetVolume] = useState(true);
  const canFade = useRef(true);
  useEffect(() => {
    const probe = new Audio();
    probe.volume = 0.5;
    canFade.current = probe.volume === 0.5;
    setCanSetVolume(canFade.current);
    const mq = window.matchMedia("(max-width: 720px), (hover: none) and (pointer: coarse)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const [needsTap, setNeedsTap] = useState(false);
  const needsTapRef = useRef(false);
  const [queueOpen, setQueueOpen] = useState(false);

  const savePrefs = (next: Partial<Prefs>) =>
    setPrefs((p) => {
      const merged = { ...p, ...next };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        return merged;
      }
      return merged;
    });

  useEffect(() => {
    if (!cid) return;
    const beat = () => musicHeartbeat(cid).catch(() => {});
    beat();
    const t = setInterval(beat, 30_000);
    return () => clearInterval(t);
  }, [cid]);

  const blocked = useCallback((err: DOMException) => {
    if (err.name !== "NotAllowedError") return;
    needsTapRef.current = true;
    setNeedsTap(true);
  }, []);

  const softLevel = useCallback(() => {
    const f = soft.current;
    if (!f) return 1;
    const p = EASE.inOut(clamp01((performance.now() - f.from) / SOFT_MS));
    return f.dir > 0 ? f.start + (1 - f.start) * p : f.start * (1 - p);
  }, []);

  const applyGains = useCallback(() => {
    const st = stateRef.current;
    const base = gainOf(prefsRef.current.volume);
    const fade = canFade.current;
    const now = serverNow();
    const ease = EASE[st?.fade.easing ?? "inOut"];
    const fadeMs = (st?.fade.crossfade ?? 0) * 1000;
    const sl = softLevel();

    for (const [i, d] of decks.current.entries()) {
      if (!d) continue;
      let g = sl;
      const out = fadeOut.current;
      const into = fadeIn.current;
      if (out?.deck === i) {
        const p = fadeMs ? clamp01((now - out.from) / fadeMs) : 1;
        g *= 1 - ease(p);
        if (p >= 1 || d.ended) {
          d.pause();
          fadeOut.current = null;
        }
      } else if (i === live.current && into && loaded.current[i] === into.url) {
        const p = fadeMs ? clamp01((now - into.from) / fadeMs) : 1;
        g *= ease(p);
        if (p >= 1) fadeIn.current = null;
      }
      const vol = fade ? base * g : base;
      if (Math.abs(d.volume - vol) > 1e-4) d.volume = vol;
    }
    if (soft.current?.dir === -1 && sl <= 0 && !st?.playing) {
      for (const d of decks.current) if (d && !d.paused) d.pause();
      fadeOut.current = null;
    }
    if (soft.current?.dir === 1 && sl >= 1) soft.current = null;

    const t = performance.now();
    const dt = Math.min(0.5, (t - (lastTick.current || t)) / 1000);
    lastTick.current = t;
    for (const [id, l] of layers.current) {
      const step = fade ? dt / AMBIENCE_RAMP_S : 1;
      l.level = l.level < l.target ? Math.min(l.target, l.level + step) : Math.max(l.target, l.level - step);
      const vol = fade ? base * gainOf(l.level) : base;
      if (Math.abs(l.el.volume - vol) > 1e-4) l.el.volume = vol;
      if (l.level === 0 && l.target === 0) {
        l.el.pause();
        l.el.removeAttribute("src");
        layers.current.delete(id);
      }
    }
  }, [serverNow, softLevel]);

  const syncAmbience = useCallback(() => {
    const want = new Map((stateRef.current?.ambience?.layers ?? []).map((l) => [l.id, l]));
    for (const [id, l] of layers.current) if (!want.has(id)) l.target = 0;
    for (const [id, l] of want) {
      let have = layers.current.get(id);
      if (!have && l.level > 0) {
        const el = new Audio();
        el.loop = true;
        el.preload = "auto";
        el.muted = prefsRef.current.muted;
        el.volume = 0;
        el.src = l.url;
        have = { el, level: 0, target: 0 };
        layers.current.set(id, have);
      }
      if (!have) continue;
      have.target = l.level;
      if (have.target > 0 && have.el.paused && !needsTapRef.current) have.el.play().catch(blocked);
    }
  }, [blocked]);

  const sync = useCallback(
    (force = false) => {
      const st = stateRef.current;
      if (!decks.current[0] || !decks.current[1]) return;
      if (startTimer.current) clearTimeout(startTimer.current);
      if (!st?.track) {
        for (const d of decks.current) if (!d!.paused) d!.pause();
        fadeOut.current = fadeIn.current = soft.current = null;
        return;
      }
      const t = st.track;
      const crossfade = canFade.current ? st.fade.crossfade : 0;
      if (loaded.current[live.current] !== t.url) {
        const was = live.current;
        const other = 1 - was;
        const old = decks.current[was]!;
        const crossing = crossfade > 0 && st.playing && !old.paused && !old.ended;
        if (fadeOut.current) decks.current[fadeOut.current.deck]!.pause();
        fadeOut.current = crossing ? { deck: was, from: st.startedAt } : null;
        fadeIn.current = crossing ? { url: t.url, from: st.startedAt } : null;
        if (!crossing) old.pause();
        if (crossing || loaded.current[other] === t.url) {
          if (loaded.current[other] !== t.url) {
            decks.current[other]!.src = t.url;
            loaded.current[other] = t.url;
          }
          live.current = other;
        } else {
          old.src = t.url;
          loaded.current[was] = t.url;
        }
        lastSeek.current = 0;
      }
      const a = decks.current[live.current]!;
      const target = positionAt(st, serverNow());

      const idle = 1 - live.current;
      if (fadeOut.current?.deck !== idle) {
        if (!decks.current[idle]!.paused) decks.current[idle]!.pause();
        if (st.nextUrl && st.nextUrl !== t.url && loaded.current[idle] !== st.nextUrl && (a.readyState >= 4 || target > 5)) {
          decks.current[idle]!.src = st.nextUrl;
          loaded.current[idle] = st.nextUrl;
        }
      }

      const ready = a.readyState >= 1;
      if (st.playing && target < 0) {
        if (!a.paused) a.pause();
        if (ready && a.currentTime > 0.05) a.currentTime = 0;
        startTimer.current = setTimeout(() => sync(true), -target * 1000);
        return;
      }
      if (!st.playing || target >= t.duration - 0.05) {
        if (!st.playing && st.fade.softPause && canFade.current && !a.paused) {
          if (soft.current?.dir !== -1) soft.current = { dir: -1, from: performance.now(), start: softLevel() };
          return;
        }
        if (!a.paused) a.pause();
        if (!st.playing && fadeOut.current) {
          decks.current[fadeOut.current.deck]!.pause();
          fadeOut.current = null;
        }
        if (ready && Math.abs(a.currentTime - target) > 0.25) a.currentTime = Math.min(Math.max(0, target), t.duration);
        return;
      }
      if (ready && Math.abs(a.currentTime - target) > 0.4 && (force || performance.now() - lastSeek.current > 2000)) {
        a.currentTime = Math.max(0, target);
        lastSeek.current = performance.now();
      }
      const softly = st.fade.softPause && canFade.current;
      if (a.paused && !playPending.current && !needsTapRef.current) {
        soft.current = softly && fadeIn.current?.url !== t.url ? { dir: 1, from: performance.now(), start: soft.current ? softLevel() : 0 } : null;
        applyGains();
        playPending.current = true;
        a.play()
          .catch(blocked)
          .finally(() => (playPending.current = false));
      } else if (soft.current?.dir === -1) {
        soft.current = softly ? { dir: 1, from: performance.now(), start: softLevel() } : null;
      }
    },
    [serverNow, softLevel, applyGains, blocked],
  );

  useEffect(() => {
    stateRef.current = s;
    sync(true);
    syncAmbience();
  }, [s, sync, syncAmbience]);

  useEffect(() => {
    const t = setInterval(() => sync(), 1000);
    return () => clearInterval(t);
  }, [sync]);

  useEffect(() => {
    const t = setInterval(applyGains, GAIN_TICK_MS);
    return () => clearInterval(t);
  }, [applyGains]);

  useEffect(() => {
    const all = layers.current;
    const ds = decks.current;
    return () => {
      for (const l of all.values()) {
        l.el.pause();
        l.el.removeAttribute("src");
      }
      all.clear();
      for (const d of ds) d?.pause();
    };
  }, []);

  useEffect(() => {
    prefsRef.current = prefs;
    for (const d of decks.current) if (d) d.muted = prefs.muted;
    for (const l of layers.current.values()) l.el.muted = prefs.muted;
    applyGains();
  }, [prefs, applyGains]);

  const unlockIdle = useCallback(() => {
    const d = decks.current[1 - live.current];
    if (!d || !d.src || !d.paused) return;
    const muted = d.muted;
    d.muted = true;
    d.play()
      .then(() => {
        d.pause();
        d.currentTime = 0;
      })
      .catch(() => {})
      .finally(() => (d.muted = muted));
  }, []);
  useEffect(() => {
    const once = () => unlockIdle();
    window.addEventListener("pointerdown", once, { once: true, capture: true });
    return () => window.removeEventListener("pointerdown", once, { capture: true });
  }, [unlockIdle]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const t = s?.track;
    navigator.mediaSession.metadata = t
      ? new MediaMetadata({ title: t.title, artist: t.artist ?? "", album: t.collection, artwork: t.cover ? [{ src: t.cover, sizes: "320x320", type: "image/jpeg" }] : [] })
      : null;
    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [s?.track]);

  const listen = () => {
    needsTapRef.current = false;
    setNeedsTap(false);
    if (stateRef.current?.track) decks.current[live.current]?.play().catch(() => {});
    unlockIdle();
    sync(true);
    syncAmbience();
  };

  useEffect(() => {
    const root = document.documentElement;
    if (!dock) return;
    root.classList.add("has-music");
    const ro = new ResizeObserver(() => root.style.setProperty("--music-h", `${dock.offsetHeight}px`));
    ro.observe(dock);
    return () => {
      ro.disconnect();
      root.classList.remove("has-music");
      root.style.removeProperty("--music-h");
    };
  }, [dock]);

  const track = s?.track ?? null;
  const ambience = s?.ambience ?? null;
  const sounding = !!s && ((s.playing && !!track) || !!ambience);
  const hasNext = !!s && (s.index < s.queue.length - 1 || s.repeat !== "off");
  const voteOpen = s?.vote?.status === "open";
  const onSkip = (kind: SkipKind) => run(() => (isDm ? music.skip(cid, kind) : music.requestSkip(cid, kind)));

  const volumeIcon = <Icon name={prefs.muted || prefs.volume === 0 ? "muted" : "volume"} />;
  const muteButton = (
    <button type="button" className="sb-icon-btn is-small" onClick={() => savePrefs({ muted: !prefs.muted })} aria-label={prefs.muted ? "Unmute (just for you)" : "Mute (just for you)"}>
      {volumeIcon}
    </button>
  );
  const volumeSlider = (
    <input type="range" className="sb-volume-range" style={{ "--v": prefs.muted ? 0 : prefs.volume } as CSSProperties} min={0} max={1} step={0.05} value={prefs.muted ? 0 : prefs.volume} onChange={(e) => savePrefs({ volume: Number(e.target.value), muted: false })} aria-label="Volume, just for you" />
  );
  const volume =
    compact && canSetVolume ? (
      <button type="button" className={`sb-icon-btn is-small ${volumeOpen ? "is-on" : ""}`} aria-expanded={volumeOpen} onClick={() => setVolumeOpen((o) => !o)} aria-label="Volume, just for you">
        {volumeIcon}
      </button>
    ) : (
      <span className="sb-volume">
        {muteButton}
        {canSetVolume && volumeSlider}
      </span>
    );
  const volumeRow = compact && canSetVolume && volumeOpen && (
    <div className="sb-volume-row">
      {muteButton}
      {volumeSlider}
    </div>
  );
  const dockButtons = (
    <>
      <button type="button" className="sb-icon-btn is-small" onClick={() => savePrefs({ collapsed: true })} aria-label="Fold the player away" title="Fold away">
        <Icon name="down" />
      </button>
      <button type="button" className="sb-icon-btn is-small" onClick={() => setListening(false)} aria-label="Stop listening" title="Stop listening">
        <Icon name="power" />
      </button>
    </>
  );
  const listenButton = (text: string) =>
    needsTap &&
    sounding && (
      <button type="button" className="sb-listen" onClick={listen}>
        <Icon name="play" size={14} /> {text}
      </button>
    );
  const errorLine = error && (
    <p className="sb-error" role="alert">
      {error}
    </p>
  );
  const layerNames = ambience ? ambience.layers.map((l) => l.name).join(" · ") : "";

  return (
    <>
      {[0, 1].map((i) => (
        <audio
          key={i}
          ref={(el) => {
            decks.current[i] = el;
          }}
          preload="auto"
          onLoadedMetadata={() => i === live.current && sync(true)}
          onCanPlay={() => i === live.current && sync()}
          hidden
        />
      ))}
      {s && (track || ambience) && (
        <div className="sb-float">
          <VoteCard s={s} me={userId} isDm={isDm} serverNow={serverNow} onVote={(id, yes) => run(() => music.vote(cid, id, yes))} />

          {prefs.collapsed ? (
            <button
              ref={setDock}
              type="button"
              className={`sb-mini ${track ? "" : "is-teal"}`}
              onClick={() => savePrefs({ collapsed: false })}
              aria-label={track ? `Music: ${track.title}${track.artist ? ` by ${track.artist}` : ""}. Open the player` : `Ambience: ${ambience?.name}. Open the player`}
            >
              {track ? (
                <Disc size={36} spinning={s.playing} cover={track.cover} />
              ) : (
                <span className="sb-ripple is-on is-tiny" aria-hidden="true">
                  <i />
                  <i />
                  <b />
                </span>
              )}
              <span className="sb-mini-title">{track ? track.title : ambience?.name}</span>
            </button>
          ) : track ? (
            <div ref={setDock} className="sb-dock" role="region" aria-label="The table’s music">
              <div className="sb-dock-head">
                <Disc size={34} spinning={s.playing} cover={track.cover} />
                <div className="sb-dock-what">
                  <span className="sb-eyebrow is-gold">
                    {track.collection || "The table"} · {s.index + 1} of {s.queue.length}
                    {!s.playing && " · Paused"}
                  </span>
                  <span className="sb-dock-title" title={track.title}>
                    {track.title}
                  </span>
                  {track.artist && (
                    <span className="sb-dock-artist" title={track.artist}>
                      {track.artist}
                    </span>
                  )}
                </div>
                {dockButtons}
              </div>
              <Staff compact s={s} serverNow={serverNow} onSeek={isDm ? (to) => run(() => music.seek(cid, to)) : undefined} />
              <div className="sb-dock-controls">
                <span className="sb-dock-side">
                  <button type="button" className={`sb-icon-btn is-small ${queueOpen ? "is-on" : ""}`} aria-expanded={queueOpen} onClick={() => setQueueOpen((o) => !o)} aria-label="The setlist" title="Setlist">
                    <Icon name="queue" />
                  </button>
                </span>
                <div className="sb-dock-transport">
                  <button type="button" className="sb-round is-small" onClick={() => onSkip("prev")} disabled={!isDm && voteOpen} aria-label={isDm ? "Previous song" : "Ask the table to go back a song"} title={isDm ? undefined : "Ask the table to go back a song"}>
                    <Icon name="prev" size={16} />
                  </button>
                  {isDm ? (
                    <button type="button" className="sb-play is-small" onClick={() => run(() => (s.playing ? music.pause(cid) : music.play(cid)))} aria-label={s.playing ? "Pause for everyone" : "Play for everyone"}>
                      <Icon name={s.playing ? "pause" : "play"} size={18} />
                    </button>
                  ) : (
                    <span className="sb-play is-small is-status" role="img" aria-label={s.playing ? "Playing" : "Paused by the bard"}>
                      {s.playing ? <Bars playing /> : <Icon name="pause" size={18} />}
                    </span>
                  )}
                  <button
                    type="button"
                    className="sb-round is-small"
                    onClick={() => onSkip("next")}
                    disabled={!hasNext || (!isDm && voteOpen)}
                    aria-label={isDm ? "Next song" : "Ask the table to skip this song"}
                    title={isDm ? undefined : "Ask the table to skip this song"}
                  >
                    <Icon name="next" size={16} />
                  </button>
                </div>
                <span className="sb-dock-side is-end">{volume}</span>
              </div>
              {volumeRow}
              {ambience && (
                <p className="sb-dock-amb" title={layerNames}>
                  <Icon name="waves" size={14} />
                  <span>
                    Ambience · {ambience.name} · {layerNames}
                  </span>
                </p>
              )}
              {listenButton("Tap to hear the table’s music")}
              {errorLine}
            </div>
          ) : (
            ambience && (
              <div ref={setDock} className="sb-dock is-ambience" role="region" aria-label="The table’s ambience">
                <div className="sb-dock-head">
                  <span className="sb-ripple is-on is-small" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <b />
                  </span>
                  <div className="sb-dock-what">
                    <span className="sb-eyebrow is-teal">Ambience</span>
                    <span className="sb-dock-title" title={ambience.name}>
                      {ambience.name}
                    </span>
                    <span className="sb-dock-artist" title={layerNames}>
                      {layerNames}
                    </span>
                  </div>
                  {dockButtons}
                </div>
                <div className="sb-dock-controls">
                  <span className="sb-dock-side">
                    {isDm && (
                      <button type="button" className="sb-btn is-small" onClick={() => run(() => library.playAmbience(cid, null))} aria-label="Stop the ambience for everyone">
                        <Icon name="stop" size={12} /> Stop
                      </button>
                    )}
                  </span>
                  <span />
                  <span className="sb-dock-side is-end">{volume}</span>
                </div>
                {volumeRow}
                {listenButton("Tap to hear the table’s ambience")}
                {errorLine}
              </div>
            )
          )}

          {prefs.collapsed && needsTap && sounding && (
            <button type="button" className="sb-listen" onClick={listen}>
              <Icon name="play" size={14} /> Tap to hear the music
            </button>
          )}
        </div>
      )}
      {s && track && queueOpen && !prefs.collapsed && <Setlist s={s} cid={cid} isDm={isDm} run={run} onClose={() => setQueueOpen(false)} />}
    </>
  );
}

function VoteCard({ s, me, isDm, serverNow, onVote }: { s: State; me: string; isDm: boolean; serverNow: () => number; onVote: (id: string, yes: boolean) => void }) {
  const v = s.vote;
  const [, rerender] = useState(0);

  const settledAgo = v?.closedAt ? serverNow() - v.closedAt : Infinity;
  const showResult = !!v && (v.status === "passed" || v.status === "failed") && settledAgo < RESULT_MS;
  useEffect(() => {
    if (!showResult) return;
    const t = setTimeout(() => rerender((n) => n + 1), RESULT_MS - settledAgo + 50);
    return () => clearTimeout(t);
  }, [showResult, settledAgo]);

  if (!v || (v.status !== "open" && !showResult)) return null;

  const what = v.kind === "next" ? "skip this song" : "go back a song";
  const mine = v.by === me;
  const myVote = v.yes.includes(me) ? "yes" : v.no.includes(me) ? "no" : null;

  if (v.status !== "open") {
    const passed = v.status === "passed";
    const text =
      v.decidedBy === "dm"
        ? passed
          ? "The bard agreed."
          : "The bard kept the song playing."
        : passed
          ? v.kind === "next"
            ? "The table agreed. On to the next song."
            : "The table agreed. Back a song."
          : "The table kept the song playing.";
    return (
      <div className={`sb-vote ${passed ? "is-passed" : "is-failed"}`} role="status">
        <span className={`sb-eyebrow ${passed ? "is-gold" : ""}`}>{passed ? "Agreed" : "Kept"}</span>
        <p className="sb-vote-text">{text}</p>
      </div>
    );
  }

  const fuse = { animationDuration: `${v.endsAt - v.startedAt}ms`, animationDelay: `${v.startedAt - serverNow()}ms` };

  return (
    <div className="sb-vote" role="alertdialog" aria-label="A request about the music">
      <span key={v.id} className="sb-vote-fuse" style={fuse} aria-hidden="true" />
      <span className="sb-eyebrow is-gold">{mine ? "Your request" : isDm ? "A request for you" : "The table votes"}</span>
      <p className="sb-vote-text">{mine ? `You asked to ${what}.` : `${v.byName || "A player"} asks to ${what}.`}</p>
      <p className="sb-meta">
        {v.yes.length} for · {v.no.length} against · {v.eligible} at the table
      </p>
      {!mine && (
        <div className="sb-vote-actions">
          {isDm ? (
            <>
              <button type="button" className="sb-btn is-gold" onClick={() => onVote(v.id, true)}>
                {v.kind === "next" ? "Skip it" : "Go back"}
              </button>
              <button type="button" className="sb-btn" onClick={() => onVote(v.id, false)}>
                Keep playing
              </button>
            </>
          ) : (
            <>
              <button type="button" className={`sb-btn ${myVote === "yes" ? "is-gold" : ""}`} aria-pressed={myVote === "yes"} onClick={() => onVote(v.id, true)}>
                {v.kind === "next" ? "Skip" : "Go back"}
              </button>
              <button type="button" className={`sb-btn ${myVote === "no" ? "is-gold" : ""}`} aria-pressed={myVote === "no"} onClick={() => onVote(v.id, false)}>
                {v.kind === "next" ? "Don’t skip" : "Stay"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
