import { useMemo } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Midnight Arcane: violet night sky with breathing nebulae and twinkling stars, a huge arcane
 * circle whose rings turn at different speeds, constellations that fade in and out, and the odd
 * shooting star. Styles in styles/themes/midnight.css. Seeded = identical every load.
 */

type Pt = [number, number];

/** A rune: vertical stem plus 2–3 random branches, in a 12×16 box centred on 0,0. */
function buildRune(r: () => number) {
  let d = "M0 -8V8";
  const branches = 2 + Math.floor(r() * 2);
  for (let i = 0; i < branches; i++) {
    const y = -8 + r() * 12;
    const dir = r() < 0.5 ? -1 : 1;
    d += r() < 0.5 ? `M0 ${y.toFixed(1)}L${dir * 6} ${(y + 4).toFixed(1)}` : `M0 ${y.toFixed(1)}L${dir * 6} ${(y - 4).toFixed(1)}`;
  }
  return d;
}

/** Ring of `count` runes at radius `radius`, each turned to face outward. */
function runeRing(r: () => number, count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => ({ angle: (360 / count) * i, d: buildRune(r), radius }));
}

const triangle = (radius: number, rotDeg: number) =>
  [0, 120, 240]
    .map((a) => {
      const rad = ((a + rotDeg - 90) * Math.PI) / 180;
      return `${(Math.cos(rad) * radius).toFixed(1)},${(Math.sin(rad) * radius).toFixed(1)}`;
    })
    .join(" ");

export function MidnightBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(3301);
    const stars = Array.from({ length: 90 }, () => ({
      left: r() * 100,
      top: r() * 100,
      size: 1 + r() * 1.8,
      delay: r() * 6,
      bright: r() < 0.08,
    }));
    const constellations = [
      { cx: 260, cy: 200 },
      { cx: 1300, cy: 170 },
      { cx: 1180, cy: 700 },
    ].map(({ cx, cy }, i) => {
      const points: Pt[] = Array.from({ length: 5 + Math.floor(r() * 3) }, () => [cx + (r() - 0.5) * 300, cy + (r() - 0.5) * 180]);
      points.sort((a, b) => a[0] - b[0]);
      return { points, delay: i * 7 };
    });
    return {
      stars,
      constellations,
      outerRunes: runeRing(r, 36, 460),
      innerRunes: runeRing(r, 12, 175),
    };
  }, []);

  return (
    <div className={`theme-scene ma-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="ma-sky" />
      <div className="ma-nebula ma-nebula--1" />
      <div className="ma-nebula ma-nebula--2" />

      <div className="ma-stars">
        {scene.stars.map((s, i) => (
          <span
            key={i}
            className={s.bright ? "ma-star ma-star--bright" : "ma-star"}
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          />
        ))}
      </div>

      {/* Constellations: one SVG each, faded as a whole (composited; nothing inside an SVG animates,
          since that repaints the whole SVG every frame) */}
      {scene.constellations.map((c, i) => (
        <svg key={i} className="ma-constellation" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ animationDelay: `${c.delay}s` }} aria-hidden>
          <polyline points={c.points.map((p) => p.join(",")).join(" ")} />
          {c.points.map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={2.2} />
          ))}
        </svg>
      ))}

      {/* The arcane circle: 4 independently turning rings, each its own SVG rotated as a whole */}
      <div className="ma-circle">
        <svg className="ma-ring ma-ring--outer" viewBox="-500 -500 1000 1000" aria-hidden>
          <circle r={490} />
          <circle r={432} />
          {scene.outerRunes.map((rune, i) => (
            <path key={i} d={rune.d} transform={`rotate(${rune.angle}) translate(0 ${-rune.radius})`} />
          ))}
        </svg>
        <svg className="ma-ring ma-ring--ticks" viewBox="-500 -500 1000 1000" aria-hidden>
          {Array.from({ length: 72 }, (_, i) => (
            <line key={i} x1={0} y1={-400} x2={0} y2={i % 6 === 0 ? -380 : -392} transform={`rotate(${i * 5})`} />
          ))}
          <circle r={400} />
        </svg>
        <svg className="ma-ring ma-ring--hexagram" viewBox="-500 -500 1000 1000" aria-hidden>
          <circle r={330} />
          <polygon points={triangle(330, 0)} />
          <polygon points={triangle(330, 180)} />
          <circle r={210} />
        </svg>
        <svg className="ma-ring ma-ring--inner" viewBox="-500 -500 1000 1000" aria-hidden>
          {scene.innerRunes.map((rune, i) => (
            <path key={i} d={rune.d} transform={`rotate(${rune.angle}) translate(0 ${-rune.radius})`} />
          ))}
          <circle r={70} />
          <polygon points={triangle(70, 0)} />
        </svg>
      </div>

      {!isStatic && (
        <div className="ma-meteors">
          <span className="ma-meteor" style={{ top: "12%", left: "68%", animationDelay: "3s" }} />
          <span className="ma-meteor" style={{ top: "22%", left: "28%", animationDelay: "11s", animationDuration: "17s" }} />
          <span className="ma-meteor" style={{ top: "6%", left: "48%", animationDelay: "19s", animationDuration: "23s" }} />
        </div>
      )}
    </div>
  );
}
