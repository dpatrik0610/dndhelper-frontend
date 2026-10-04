import { useMemo, type CSSProperties } from "react";

/**
 * Frost Glacier backdrop: polar night sky, twinkling stars, aurora borealis, layered glacier
 * ranges with snowcaps, a frozen lake reflecting the aurora, ice glints, 3-depth snowfall and
 * frost creeping in from the corners. Styles in styles/frost.css. `isStatic` = no motion (mobile).
 *
 * Everything is generated from fixed seeds, so the scene is identical on every load.
 */

const W = 1600;
const H = 400;

// mulberry32: tiny deterministic PRNG
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = [number, number];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const pts = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Jagged ridge across the tile, alternating peaks and saddles, plus snowcaps on the high peaks. */
function buildRange(seed: number, top: number, bottom: number, step: [number, number], capLine: number) {
  const r = rng(seed);
  const ridge: Pt[] = [[0, bottom - r() * (bottom - top) * 0.5]];
  let peak = true;
  for (let x = 0; x < W; ) {
    x = Math.min(W, x + step[0] + r() * (step[1] - step[0]));
    const y = peak ? top + r() * (bottom - top) * 0.55 : top + (bottom - top) * (0.45 + r() * 0.5);
    ridge.push([x, y]);
    peak = !peak;
  }

  const caps: Pt[][] = [];
  for (let i = 1; i < ridge.length - 1; i++) {
    const p = ridge[i];
    if (p[1] > capLine || p[1] > ridge[i - 1][1] || p[1] > ridge[i + 1][1]) continue;
    const t = 0.28 + r() * 0.17;
    const l = lerp(p, ridge[i - 1], t);
    const rr = lerp(p, ridge[i + 1], t);
    const depth = Math.min(l[1], rr[1]) - p[1];
    // Ragged lower edge: dip, notch up at the centre, dip. All points stay below the ridge line.
    caps.push([
      p,
      rr,
      [(p[0] + rr[0]) / 2, p[1] + depth * 1.15],
      [p[0], p[1] + depth * 0.7],
      [(p[0] + l[0]) / 2, p[1] + depth * 1.2],
      l,
    ]);
  }

  return { fill: pts([...ridge, [W, H], [0, H]]), ridge: pts(ridge), caps: caps.map(pts) };
}

const RANGES = [
  { key: "far", seed: 11, top: 70, bottom: 260, step: [50, 110] as [number, number], capLine: 160 },
  { key: "mid", seed: 23, top: 140, bottom: 320, step: [70, 150] as [number, number], capLine: 230 },
  { key: "near", seed: 37, top: 220, bottom: 380, step: [90, 200] as [number, number], capLine: 300 },
];

export function FrostBackdrop({ isStatic = false }: { isStatic?: boolean }) {
  const scene = useMemo(() => {
    const r = rng(2026);
    const stars = Array.from({ length: 80 }, () => ({
      left: r() * 100,
      top: r() * 48,
      size: 1 + r() * 1.6,
      delay: r() * 6,
      twinkle: r() < 0.45,
    }));
    const glints = Array.from({ length: 9 }, () => ({ left: 5 + r() * 90, top: 46 + r() * 22, delay: r() * 9 }));
    const flakes = Array.from({ length: 46 }, (_, i) => {
      const depth = i % 3; // 0 far, 1 mid, 2 near
      return {
        left: r() * 100,
        size: [2, 3.5, 6][depth] + r() * [1, 1.5, 3][depth],
        duration: [26, 17, 11][depth] + r() * 8,
        delay: -r() * 30,
        drift: (r() - 0.5) * 120,
        depth,
      };
    });
    return { stars, glints, flakes, ranges: RANGES.map((g) => ({ ...g, shape: buildRange(g.seed, g.top, g.bottom, g.step, g.capLine) })) };
  }, []);

  return (
    <div className={`fr-overlay ${isStatic ? "fr-overlay--static" : ""}`}>
      <div className="fr-sky" />

      <div className="fr-stars">
        {scene.stars.map((s, i) => (
          <span
            key={i}
            className={s.twinkle ? "fr-star fr-star--twinkle" : "fr-star"}
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          />
        ))}
      </div>

      <div className="fr-aurora">
        <div className="fr-aurora__band fr-aurora__band--1" />
        <div className="fr-aurora__band fr-aurora__band--2" />
        <div className="fr-aurora__band fr-aurora__band--3" />
      </div>

      <svg className="fr-mountains" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="fr-range-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b7fa8" />
            <stop offset="1" stopColor="#1c3456" />
          </linearGradient>
          <linearGradient id="fr-range-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a5f8a" />
            <stop offset="1" stopColor="#0f2240" />
          </linearGradient>
          <linearGradient id="fr-range-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#24456e" />
            <stop offset="1" stopColor="#061328" />
          </linearGradient>
          <linearGradient id="fr-snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#bae6fd" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {scene.ranges.map((g) => (
          <g key={g.key} className={`fr-range fr-range--${g.key}`}>
            <polygon points={g.shape.fill} fill={`url(#fr-range-${g.key})`} />
            {g.shape.caps.map((cap, i) => (
              <polygon key={i} points={cap} fill="url(#fr-snow)" opacity={g.key === "far" ? 0.55 : 0.85} />
            ))}
            {/* moonlit ice rim along the ridge */}
            <polyline points={g.shape.ridge} fill="none" stroke="#e0f2fe" strokeOpacity={g.key === "near" ? 0.35 : 0.2} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>

      <div className="fr-lake">
        <svg className="fr-cracks" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden>
          <path d="M120 40 L260 70 L300 120 L420 140 M260 70 L340 50 M900 30 L1020 90 L1180 100 L1260 160 M1020 90 L1060 40 M600 150 L720 130 L800 175 M1350 60 L1480 80 L1560 50" />
        </svg>
      </div>

      <div className="fr-glints">
        {scene.glints.map((g, i) => (
          <span key={i} className="fr-glint" style={{ left: `${g.left}%`, top: `${g.top}%`, animationDelay: `${g.delay}s` }} />
        ))}
      </div>

      {!isStatic && (
        <div className="fr-snow">
          {scene.flakes.map((f, i) => (
            <span
              key={i}
              className={`fr-flake fr-flake--d${f.depth}`}
              style={{
                left: `${f.left}%`,
                width: f.size,
                height: f.size,
                animationDuration: `${f.duration}s`,
                animationDelay: `${f.delay}s`,
                "--drift": `${f.drift}px`,
              } as CSSProperties}
            />
          ))}
        </div>
      )}

      {!isStatic && (
        <svg className="fr-frost" aria-hidden>
          <filter id="fr-frost-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={4} />
            <feColorMatrix values="0 0 0 0 0.88  0 0 0 0 0.95  0 0 0 0 1  0 0 0 1.4 -0.62" />
          </filter>
          <rect width="100%" height="100%" filter="url(#fr-frost-noise)" />
        </svg>
      )}
    </div>
  );
}
