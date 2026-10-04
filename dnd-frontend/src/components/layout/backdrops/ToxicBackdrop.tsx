import { useMemo, type CSSProperties } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Toxic Spore: atmospheric toxic sewer, told through light only (no drawn objects).
 * A sickly glow breathing up from unseen sludge below, its rippling reflections playing across the
 * dark above, a pale shaft of light from an overhead grate, layered fog banks drifting at different
 * speeds, large out-of-focus motes rising, soft bubble-burst flares near the bottom, deep vignette.
 * Every layer is a soft gradient moved/faded via transform/opacity only.
 * (Fine motes = the shared particles.) Styles in styles/themes/toxic.css. Seeded = identical every load.
 */

export function ToxicBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(7331);
    const reflections = Array.from({ length: 7 }, () => ({
      left: 5 + r() * 80,
      top: 2 + r() * 40,
      w: 18 + r() * 22,
      h: 6 + r() * 8,
      dur: 9 + r() * 9,
      delay: -r() * 18,
      dx: 20 + r() * 50,
    }));
    const bokeh = Array.from({ length: 11 }, () => ({
      left: r() * 100,
      size: 24 + r() * 90,
      dur: 22 + r() * 26,
      delay: -r() * 48,
      sway: (r() - 0.5) * 120,
      hue: r() < 0.7 ? "green" : "yellow",
    }));
    const flares = Array.from({ length: 4 }, () => ({ left: 15 + r() * 70, dur: 5 + r() * 6, delay: -r() * 10 }));
    return { reflections, bokeh, flares };
  }, []);

  return (
    <div className={`theme-scene tx-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="tx-base" />

      {/* sludge glow breathing up from below */}
      <div className="tx-glow tx-glow--main" />
      <div className="tx-glow tx-glow--left" />
      <div className="tx-glow tx-glow--right" />

      {/* rippling reflections of the liquid on the dark above */}
      <div className="tx-reflections">
        {scene.reflections.map((p, i) => (
          <span
            key={i}
            className="tx-reflection"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.w}vw`,
              height: `${p.h}vh`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              "--dx": `${p.dx}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* pale light through an overhead grate */}
      <div className="tx-shaft" />

      {/* fog banks, back to front */}
      <div className="tx-fog tx-fog--1" />
      <div className="tx-fog tx-fog--2" />
      <div className="tx-fog tx-fog--3" />
      <div className="tx-fog tx-fog--4" />

      {/* out-of-focus motes rising */}
      <div className="tx-bokeh">
        {scene.bokeh.map((b, i) => (
          <span
            key={i}
            className={`tx-mote tx-mote--${b.hue}`}
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              "--sway": `${b.sway}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* bubbles bursting in the sludge: soft flares near the bottom */}
      <div className="tx-flares">
        {scene.flares.map((fl, i) => (
          <span key={i} className="tx-flare" style={{ left: `${fl.left}%`, animationDuration: `${fl.dur}s`, animationDelay: `${fl.delay}s` }} />
        ))}
      </div>

      <div className="tx-vignette" />
    </div>
  );
}
