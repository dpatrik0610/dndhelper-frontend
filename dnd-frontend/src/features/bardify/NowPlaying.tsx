import { useMusicStore } from "@store/music/musicStore";
import { music } from "@services/musicService";
import { usePlayerRunner, useServerClock } from "./lib";
import { Bars, Disc, Icon } from "./icons";
import Setlist from "./Setlist";
import Staff from "./Staff";
import { ErrorLine } from "./shared";

export default function NowPlaying() {
  const s = useMusicStore((st) => st.state);
  const { cid, run, error } = usePlayerRunner();
  const serverNow = useServerClock(cid);
  if (!s) return null;

  const track = s.track;
  const ambience = s.ambience;
  const hasNext = s.index < s.queue.length - 1 || s.repeat !== "off";
  const repeatLabel = s.repeat === "one" ? "Repeating this song" : s.repeat === "all" ? "Repeating the setlist" : "Repeat off";
  const nextRepeat = s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off";

  return (
    <section className="sb-stage" aria-label="Now playing">
      <div className="sb-panel sb-now">
        <Disc size={232} spinning={!!track && s.playing} cover={track?.cover} />
        <div className="sb-now-body">
          {track ? (
            <>
              <div className="sb-now-what">
                <span className="sb-eyebrow is-gold">
                  <Bars playing={s.playing} />
                  {s.playing ? "Now playing" : "Paused"} · {track.collection || "The table"} · {s.index + 1} of {s.queue.length}
                </span>
                <h2 className="sb-now-title">{track.title}</h2>
                {track.artist && <p className="sb-now-artist">{track.artist}</p>}
              </div>
              <Staff s={s} serverNow={serverNow} onSeek={(to) => run(() => music.seek(cid, to))} />
              <div className="sb-transport">
                <button type="button" className={`sb-icon-btn is-boxed ${s.shuffle ? "is-on" : ""}`} aria-pressed={s.shuffle} aria-label="Shuffle" onClick={() => run(() => music.shuffle(cid, !s.shuffle))}>
                  <Icon name="shuffle" size={20} />
                </button>
                <button type="button" className="sb-round" aria-label="Previous song" onClick={() => run(() => music.skip(cid, "prev"))}>
                  <Icon name="prev" size={20} />
                </button>
                <button type="button" className="sb-play" aria-label={s.playing ? "Pause for everyone" : "Play for everyone"} onClick={() => run(() => (s.playing ? music.pause(cid) : music.play(cid)))}>
                  <Icon name={s.playing ? "pause" : "play"} size={26} />
                </button>
                <button type="button" className="sb-round" aria-label="Next song" disabled={!hasNext} onClick={() => run(() => music.skip(cid, "next"))}>
                  <Icon name="next" size={20} />
                </button>
                <button type="button" className={`sb-icon-btn is-boxed sb-repeat ${s.repeat !== "off" ? "is-on" : ""}`} aria-pressed={s.repeat !== "off"} aria-label={`${repeatLabel}. Change`} title={repeatLabel} onClick={() => run(() => music.repeat(cid, nextRepeat))}>
                  <Icon name="repeat" size={20} />
                  {s.repeat === "one" && <b>1</b>}
                </button>
              </div>
            </>
          ) : (
            <div className="sb-now-what">
              <span className="sb-eyebrow">Silence at the table</span>
              <h2 className="sb-now-title">Nothing playing</h2>
              <p className="sb-now-artist">Choose a situation below and play it for everyone listening.</p>
            </div>
          )}
          {ambience && (
            <span className="sb-chip is-teal" title={ambience.layers.map((l) => l.name).join(" · ")}>
              <Icon name="waves" size={16} />
              {[ambience.name, ...ambience.layers.map((l) => l.name)].join(" · ")}
            </span>
          )}
          <ErrorLine error={error} />
        </div>
      </div>
      {track && <Setlist s={s} cid={cid} isDm run={run} />}
    </section>
  );
}
