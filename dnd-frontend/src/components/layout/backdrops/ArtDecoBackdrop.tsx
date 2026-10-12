import { useMemo } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Art Deco: a 1920s poster. A gilt sunburst turns slowly behind a skyline of stepped skyscrapers,
 * two premiere searchlights sweep the onyx sky and gold glints twinkle. Styles in
 * styles/themes/art-deco.css. Seeded = identical every load.
 */

const BASE = 320; // skyline SVG height; towers stand on y = BASE

interface Tower {
  d: string;
  windows: [number, number][];
}

/** A ziggurat tower: setbacks narrow it towards the top, optionally crowned with a spire. */
function buildTower(r: () => number, cx: number, w: number, h: number, tiers: number, spire: number, lit: number): Tower {
  const steps: { half: number; top: number }[] = [];
  let half = w / 2;
  let top = BASE - h * 0.6;
  for (let t = 0; t < tiers; t++) {
    steps.push({ half, top });
    half *= 0.68 + r() * 0.12;
    top -= (h * 0.4) / tiers;
  }
  // Up the left side (step inward at each setback), over the crown, down the right side
  let d = `M${cx - steps[0].half} ${BASE}`;
  steps.forEach((s, i) => {
    if (i > 0) d += `L${cx - s.half} ${steps[i - 1].top}`;
    d += `L${cx - s.half} ${s.top}`;
  });
  const last = steps[steps.length - 1];
  if (spire) d += `L${cx} ${last.top - spire}`;
  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i];
    d += `L${cx + s.half} ${s.top}L${cx + s.half} ${i === 0 ? BASE : steps[i - 1].top}`;
  }
  d += "Z";

  // Lit windows on the bottom tier only (unlit ones aren't drawn)
  const windows: [number, number][] = [];
  const b = steps[0];
  for (let x = cx - b.half + 5; x < cx + b.half - 6; x += 9) {
    for (let y = b.top + 8; y < BASE - 6; y += 12) {
      if (r() < lit) windows.push([x, y]);
    }
  }
  return { d, windows };
}

function skylineRow(r: () => number, minH: number, maxH: number, lit: number) {
  const towers: Tower[] = [];
  for (let x = -20; x < 1620; ) {
    const w = 50 + r() * 70;
    const h = minH + r() * (maxH - minH);
    towers.push(buildTower(r, x + w / 2, w, h, 2 + Math.floor(r() * 3), r() < 0.3 ? 20 + r() * 40 : 0, lit));
    x += w * (0.75 + r() * 0.4);
  }
  return towers;
}

/** Sunburst wedges: every other 7.5° slice of a full circle. */
const rays = Array.from({ length: 24 }, (_, i) => {
  const a0 = ((i * 15 - 3.75) * Math.PI) / 180;
  const a1 = ((i * 15 + 3.75) * Math.PI) / 180;
  return `0,0 ${(Math.cos(a0) * 500).toFixed(1)},${(Math.sin(a0) * 500).toFixed(1)} ${(Math.cos(a1) * 500).toFixed(1)},${(Math.sin(a1) * 500).toFixed(1)}`;
});

export function ArtDecoBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(1925);
    return {
      back: skylineRow(r, 130, 230, 0),
      front: skylineRow(r, 60, 170, 0.12),
      hero: buildTower(r, 800, 130, 290, 4, 70, 0.18),
      glints: Array.from({ length: 34 }, () => ({ left: r() * 100, top: r() * 55, delay: r() * 7, size: 5 + r() * 6 })),
    };
  }, []);

  return (
    <div className={`theme-scene ad-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="ad-sky" />

      {/* Sunburst + rising-sun arcs, anchored at the bottom centre */}
      <div className="ad-sun">
        <svg className="ad-rays" viewBox="-500 -500 1000 1000" aria-hidden>
          <defs>
            <radialGradient id="ad-ray-fade">
              <stop offset="0%" stopColor="#e9c862" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#e9c862" stopOpacity="0" />
            </radialGradient>
          </defs>
          {rays.map((p, i) => (
            <polygon key={i} points={p} fill="url(#ad-ray-fade)" />
          ))}
        </svg>
        <svg className="ad-arcs" viewBox="-300 -300 600 600" aria-hidden>
          {[120, 160, 200, 240, 290].map((rad) => (
            <circle key={rad} r={rad} />
          ))}
          <circle className="ad-arcs__disc" r={92} />
        </svg>
      </div>

      <span className="ad-beam ad-beam--left" />
      <span className="ad-beam ad-beam--right" />

      <div className="ad-glints">
        {scene.glints.map((g, i) => (
          <span key={i} className="ad-glint" style={{ left: `${g.left}%`, top: `${g.top}%`, width: g.size, height: g.size, animationDelay: `${g.delay}s` }} />
        ))}
      </div>

      <svg className="ad-skyline" viewBox={`0 0 1600 ${BASE}`} preserveAspectRatio="xMidYMax slice" aria-hidden>
        <g className="ad-skyline__back">
          {scene.back.map((t, i) => (
            <path key={i} d={t.d} />
          ))}
        </g>
        <g className="ad-skyline__front">
          {[...scene.front, scene.hero].map((t, i) => (
            <path key={i} d={t.d} />
          ))}
        </g>
        <g className="ad-skyline__windows">
          {[...scene.front, scene.hero].flatMap((t, i) => t.windows.map(([x, y], k) => <rect key={`${i}-${k}`} x={x} y={y} width={3} height={5} />))}
        </g>
      </svg>
    </div>
  );
}
