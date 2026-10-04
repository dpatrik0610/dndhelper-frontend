import { useMemo, type CSSProperties } from "react";
import { seededRandom as rng } from "@utils/seededRandom";
import { ShaderCanvas } from "./ShaderCanvas";

/**
 * Frost Glacier backdrop: polar night sky with an aurora borealis (shader), twinkling stars, layered glacier
 * ranges with snowcaps, a frozen lake reflecting the aurora, ice glints, 3-depth snowfall and
 * frost creeping in from the corners. Styles in styles/themes/frost.css. `isStatic` = no motion (mobile).
 *
 * Everything is generated from fixed seeds, so the scene is identical on every load.
 */

/**
 * Night sky with the aurora: three curtains of light, each hanging from a lower edge that waves
 * slowly along its length. Bright and green at the edge, fading upward into violet, broken into
 * drifting patches and fine shimmering rays. The sky gradient matches .fr-sky (the no-WebGL fallback).
 */
const AURORA = /* glsl */ `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;

float hash(float n) { return fract(sin(n) * 43758.5453); }
float noise(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f); }

vec3 sky(vec2 uv) {
  float y = 1.0 - uv.y; // 0 at the top
  vec3 c = mix(vec3(0.008, 0.031, 0.086), vec3(0.020, 0.082, 0.188), smoothstep(0.0, 0.4, y));
  c = mix(c, vec3(0.043, 0.165, 0.302), smoothstep(0.4, 0.68, y));
  c = mix(c, vec3(0.082, 0.275, 0.420), smoothstep(0.68, 0.8, y));
  c = mix(c, vec3(0.039, 0.114, 0.212), smoothstep(0.8, 1.0, y));
  vec2 g = (vec2(uv.x, y) - vec2(0.5, 0.78)) / vec2(0.8, 0.4);
  return c + vec3(0.22, 0.74, 0.97) * 0.18 * (1.0 - smoothstep(0.0, 0.7, length(g)));
}

// One curtain: light above a waving lower edge at height base, decaying upward over height.
vec3 curtain(vec2 uv, float aspect, float base, float seed, float height, vec3 low, vec3 high, float speed) {
  float x = uv.x * aspect;
  float t = uTime * speed;
  float edge = base
    + 0.06 * sin(x * 1.7 + seed + t * 0.5)
    + 0.035 * sin(x * 3.9 - seed * 1.3 - t * 0.8)
    + 0.04 * (noise(x * 2.5 + seed * 7.0 + t * 0.3) - 0.5);
  float d = uv.y - edge;
  float lower = smoothstep(-0.015, 0.01, d);                 // soft lower border
  float fade = exp(-max(d, 0.0) / height);                   // dims as it rises
  float glow = exp(-abs(d) / 0.012) * 0.6;                   // the bright seam along the edge
  float rays = 0.55 + 0.45 * noise(x * 26.0 + seed * 3.0 + t * 1.2) * noise(x * 7.0 - t * 0.6 + seed);
  float patches = smoothstep(0.2, 0.8, noise(x * 1.1 + seed * 5.0 + t * 0.2));
  float a = (lower * fade * rays + glow) * (0.25 + 0.75 * patches);
  return mix(low, high, smoothstep(0.0, height * 2.2, d)) * a;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec3 au = curtain(uv, aspect, 0.58, 0.0, 0.2, vec3(0.25, 1.0, 0.55), vec3(0.5, 0.25, 0.9), 0.25)
          + curtain(uv, aspect, 0.70, 4.1, 0.15, vec3(0.2, 0.9, 0.75), vec3(0.6, 0.3, 0.95), 0.2) * 0.65
          + curtain(uv, aspect, 0.82, 9.7, 0.11, vec3(0.35, 0.95, 0.6), vec3(0.4, 0.35, 1.0), 0.3) * 0.4;
  gl_FragColor = vec4(sky(uv) + au * 0.65, 1.0);
}
`;

const W = 1600;
const H = 400;


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
      <div className="fr-aurora">
        <ShaderCanvas fragment={AURORA} scale={0.5} fps={30} isStatic={isStatic} staticTime={30} />
      </div>

      <div className="fr-stars">
        {scene.stars.map((s, i) => (
          <span
            key={i}
            className={s.twinkle ? "fr-star fr-star--twinkle" : "fr-star"}
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          />
        ))}
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
