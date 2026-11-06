import { useCallback, useEffect, useRef } from "react";
import type { MusicState } from "@appTypes/Music";
import { clock, positionAt } from "./sync";

export default function Staff({ s, serverNow, onSeek, compact }: { s: MusicState; serverNow: () => number; onSeek?: (to: number) => Promise<unknown>; compact?: boolean }) {
  const bar = useRef<HTMLDivElement>(null);
  const now = useRef<HTMLSpanElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const scrub = useRef<number | null>(null);
  const duration = s.track?.duration ?? 0;

  const paint = useCallback(() => {
    if (!s.track) return;
    const pos = Math.min(Math.max(0, scrub.current ?? positionAt(s, serverNow())), duration);
    bar.current?.style.setProperty("--p", String(duration ? pos / duration : 0));
    const text = clock(pos);
    if (now.current && now.current.textContent !== text) now.current.textContent = text;
    if (input.current && scrub.current === null) input.current.value = String(pos);
  }, [s, serverNow, duration]);

  useEffect(() => {
    paint();
    if (!s.playing) return;
    const t = setInterval(paint, 250);
    return () => clearInterval(t);
  }, [s.playing, paint]);

  const commit = () => {
    if (scrub.current === null || !onSeek) return;
    void onSeek(scrub.current).finally(() => {
      scrub.current = null;
      paint();
    });
  };

  return (
    <div className={`sb-staff ${compact ? "is-compact" : ""}`}>
      <span ref={now} className="sb-time">
        0:00
      </span>
      <div ref={bar} className={`sb-staff-bar ${onSeek ? "is-seekable" : ""}`}>
        <span className="sb-staff-lines" />
        <span className="sb-staff-fill" />
        <span className="sb-staff-head" aria-hidden="true">
          {!compact && (
            <svg viewBox="0 0 20 34" width="20" height="34">
              <ellipse cx="7" cy="27" rx="6.5" ry="4.6" transform="rotate(-20 7 27)" fill="currentColor" />
              <path d="M13 26V3c2 3 6 4 6 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </span>
        {onSeek && (
          <input
            ref={input}
            type="range"
            min={0}
            max={duration}
            step={0.5}
            defaultValue={0}
            aria-label="Position in the song"
            onInput={(e) => {
              scrub.current = Number(e.currentTarget.value);
              paint();
            }}
            onPointerUp={commit}
            onKeyUp={commit}
            onBlur={commit}
          />
        )}
      </div>
      <span className="sb-time">{clock(duration)}</span>
    </div>
  );
}
