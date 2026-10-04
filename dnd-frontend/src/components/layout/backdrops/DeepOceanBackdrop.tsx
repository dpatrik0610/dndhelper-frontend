import { useMemo, type CSSProperties } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Deep Ocean: dark open water lit faintly from the surface. Soft volumetric light, a rocky seabed
 * with sea grass, swaying giant kelp, translucent jellyfish (bell, oral arms, trailing tentacles)
 * rising slowly, a manta gliding far off. Realism comes from gradients, translucency and depth blur
 * rather than flat shapes. Moving creatures are separate DOM layers (each a small inline SVG) so the
 * browser can move them without re-rasterising; static scenery is one SVG.
 * (Bubbles = the shared particles.) Styles in styles/themes/deep-ocean.css. Seeded = identical every load.
 */

const W = 1600;
const H = 900;
type Pt = [number, number];
const f = (n: number) => n.toFixed(1);

/** Smooth closed rock outline: rounded top, flat bottom at `baseY`. */
function rock(r: () => number, x: number, w: number, h: number, baseY: number) {
  const bumps = 4;
  let d = `M${f(x)} ${baseY}`;
  for (let i = 0; i < bumps; i++) {
    const x1 = x + (w / bumps) * (i + 0.5);
    const x2 = x + (w / bumps) * (i + 1);
    const y1 = baseY - h * (0.55 + r() * 0.45) * Math.sin(((i + 0.5) / bumps) * Math.PI);
    const y2 = i === bumps - 1 ? baseY : baseY - h * (0.5 + r() * 0.4) * Math.sin(((i + 1) / bumps) * Math.PI);
    d += `Q${f(x1)} ${f(y1 - 6)} ${f(x2)} ${f(y2)}`;
  }
  return `${d}Z`;
}

/** Tapered sea-grass blade from (x, baseY), curving to one side. */
function blade(r: () => number, x: number, baseY: number) {
  const h = 30 + r() * 70;
  const lean = (r() - 0.5) * 40;
  const w = 2 + r() * 2.5;
  return `M${f(x - w)} ${baseY}Q${f(x + lean * 0.3)} ${f(baseY - h * 0.6)} ${f(x + lean)} ${f(baseY - h)}Q${f(x + lean * 0.3 + w)} ${f(baseY - h * 0.55)} ${f(x + w)} ${baseY}Z`;
}

/** Giant kelp in a local box (width 120, height h, base at bottom centre): tapered stipe, leaf blades, gas bladders. */
function kelpShape(r: () => number, h: number) {
  const cx = 60;
  const phase = r() * 6;
  const stipe: Pt[] = [];
  for (let y = 0; y <= h; y += 16) stipe.push([cx + Math.sin(y / 60 + phase) * 10, h - y]);
  const left = stipe.map(([x, y], i) => [x - 2.6 * (1 - i / stipe.length) - 0.6, y] as Pt);
  const right = stipe.map(([x, y], i) => [x + 2.6 * (1 - i / stipe.length) + 0.6, y] as Pt).reverse();
  const stem = `M${[...left, ...right].map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;
  const blades = stipe
    .filter((_, i) => i > 1 && i < stipe.length - 1)
    .map(([x, y], i) => {
      const dir = i % 2 ? 1 : -1;
      const len = 22 + r() * 22;
      const droop = 6 + r() * 10;
      return {
        d: `M${f(x)} ${f(y)}Q${f(x + dir * len * 0.5)} ${f(y - droop - 6)} ${f(x + dir * len)} ${f(y - droop)}Q${f(x + dir * len * 0.45)} ${f(y - droop * 0.2 + 4)} ${f(x)} ${f(y)}Z`,
        bladder: [x + dir * 3, y] as Pt,
      };
    });
  return { stem, blades };
}

const MANTA =
  "M0 -18C20 -20 46 -30 80 -46C104 -56 132 -50 150 -40C120 -30 96 -14 70 6C52 20 30 26 12 28L5 70L0 118L-5 70L-12 28C-30 26 -52 20 -70 6C-96 -14 -120 -30 -150 -40C-132 -50 -104 -56 -80 -46C-46 -30 -20 -20 0 -18Z";

const HUES = {
  cyan: { core: "#e0f7ff", mid: "#38bdf8", edge: "#0369a1" },
  pink: { core: "#fdf2f8", mid: "#f472b6", edge: "#9d174d" },
  violet: { core: "#f5f3ff", mid: "#a78bfa", edge: "#5b21b6" },
};

function Jellyfish({ id, hue }: { id: string; hue: keyof typeof HUES }) {
  const c = HUES[hue];
  return (
    <svg viewBox="-50 -46 100 230" className="do-jelly__svg" aria-hidden>
      <defs>
        <radialGradient id={`${id}-bell`} cx="0.5" cy="0.25" r="0.75">
          <stop offset="0" stopColor={c.core} stopOpacity="0.75" />
          <stop offset="0.45" stopColor={c.mid} stopOpacity="0.35" />
          <stop offset="1" stopColor={c.edge} stopOpacity="0.08" />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={c.mid} stopOpacity="0.45" />
          <stop offset="1" stopColor={c.mid} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-arm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.mid} stopOpacity="0.45" />
          <stop offset="1" stopColor={c.mid} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-tent`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.core} stopOpacity="0.35" />
          <stop offset="1" stopColor={c.core} stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={-8} rx={48} ry={40} fill={`url(#${id}-glow)`} />
      <g className="do-jelly__trail">
        {[-28, -18, -9, 9, 18, 28].map((x, i) => (
          <path key={i} d={`M${x} 2C${x - 6} 60 ${x + 8} 110 ${x - 2} 180`} fill="none" stroke={`url(#${id}-tent)`} strokeWidth={0.9} />
        ))}
        {/* ruffled oral arms */}
        <path d="M-7 2C-16 36 2 64 -9 104C-5 108 -1 106 1 102C-6 66 9 38 1 2Z" fill={`url(#${id}-arm)`} />
        <path d="M5 2C14 30 -1 62 10 96C6 100 2 99 1 95C6 62 -6 34 -2 2Z" fill={`url(#${id}-arm)`} />
      </g>
      <g className="do-jelly__bell">
        <path d="M-38 0C-38 -44 38 -44 38 0C30 5 22 -2 14 3C6 -1 -6 -1 -14 3C-22 -2 -30 5 -38 0Z" fill={`url(#${id}-bell)`} />
        {/* gonads: four faint rings seen through the bell */}
        {[-12, -4, 4, 12].map((x, i) => (
          <ellipse key={i} cx={x} cy={-14} rx={4.5} ry={6} fill="none" stroke={c.core} strokeOpacity={0.22} strokeWidth={1.2} />
        ))}
        <path d="M-30 -14C-24 -32 24 -32 30 -14" fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={2} />
      </g>
    </svg>
  );
}

function Kelp({ shape, h, id }: { shape: ReturnType<typeof kelpShape>; h: number; id: string }) {
  return (
    <svg viewBox={`0 0 120 ${h}`} width={120} height={h} aria-hidden>
      <defs>
        <linearGradient id={`${id}-k`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1f2a12" />
          <stop offset="0.5" stopColor="#4a4f1e" />
          <stop offset="1" stopColor="#1a2410" />
        </linearGradient>
      </defs>
      <path d={shape.stem} fill="#2b3214" />
      {shape.blades.map((b, i) => (
        <g key={i}>
          <path d={b.d} fill={`url(#${id}-k)`} opacity={0.85} />
          <circle cx={b.bladder[0]} cy={b.bladder[1]} r={2.6} fill="#5a5a22" />
        </g>
      ))}
    </svg>
  );
}

export function DeepOceanBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(4242);
    const rocks = [
      { x: -40, w: 380, h: 70 },
      { x: 300, w: 260, h: 44 },
      { x: 980, w: 340, h: 60 },
      { x: 1280, w: 380, h: 84 },
    ].map((k) => rock(r, k.x, k.w, k.h, H));
    const farRocks = [
      { x: 120, w: 520, h: 110 },
      { x: 760, w: 600, h: 90 },
    ].map((k) => rock(r, k.x, k.w, k.h, H - 40));
    const grass = Array.from({ length: 70 }, () => blade(r, r() * W, H));
    const kelps = [3, 9, 16, 82, 88, 94].map((left) => {
      const h = 260 + r() * 260;
      return { left, h, shape: kelpShape(r, h), delay: -r() * 7, far: left === 16 || left === 82 };
    });
    const jellies = Array.from({ length: 5 }, (_, i) => ({
      left: 8 + r() * 84,
      size: 70 + r() * 70,
      duration: 70 + r() * 40,
      delay: -r() * 100,
      hue: (["cyan", "pink", "violet"] as const)[i % 3],
      far: i >= 3,
    }));
    return { rocks, farRocks, grass, kelps, jellies };
  }, []);

  return (
    <div className={`theme-scene do-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="do-water" />

      <div className="do-rays">
        {[30, 42, 55, 66].map((left, i) => (
          <span key={i} className="do-ray" style={{ left: `${left}%`, animationDelay: `${-i * 3}s` }} />
        ))}
      </div>

      {/* far manta, softened by distance */}
      <span className="do-manta" aria-hidden>
        <svg viewBox="-155 -60 310 185" width={260} height={155}>
          <defs>
            <radialGradient id="do-manta-g" cx="0.5" cy="0.35">
              <stop offset="0" stopColor="#0a2a44" />
              <stop offset="1" stopColor="#031322" />
            </radialGradient>
          </defs>
          <path d={MANTA} fill="url(#do-manta-g)" />
        </svg>
      </span>

      {/* static seabed: far rocks (blurred by distance), near rocks with top-lit shading, sea grass */}
      <svg className="do-bed" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden>
        <defs>
          <linearGradient id="do-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d2a3d" />
            <stop offset="0.4" stopColor="#061826" />
            <stop offset="1" stopColor="#020a12" />
          </linearGradient>
          <linearGradient id="do-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1f2c" stopOpacity="0" />
            <stop offset="1" stopColor="#06121c" />
          </linearGradient>
          <linearGradient id="do-grass" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#06150f" />
            <stop offset="1" stopColor="#1d3b2a" />
          </linearGradient>
          <filter id="do-far-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <g filter="url(#do-far-blur)" opacity={0.6}>
          {scene.farRocks.map((d, i) => (
            <path key={i} d={d} fill="#05192a" />
          ))}
        </g>
        <rect x={0} y={H - 120} width={W} height={120} fill="url(#do-sand)" />
        {scene.rocks.map((d, i) => (
          <path key={i} d={d} fill="url(#do-rock)" />
        ))}
        {scene.grass.map((d, i) => (
          <path key={i} d={d} fill="url(#do-grass)" />
        ))}
      </svg>

      {scene.kelps.map((k, i) => (
        <span
          key={i}
          className={`do-kelp ${k.far ? "do-kelp--far" : ""}`}
          style={{ left: `${k.left}%`, animationDelay: `${k.delay}s` } as CSSProperties}
        >
          <Kelp shape={k.shape} h={k.h} id={`do-kelp-${i}`} />
        </span>
      ))}

      {scene.jellies.map((j, i) => (
        <span
          key={i}
          className={`do-jelly ${j.far ? "do-jelly--far" : ""}`}
          style={{ "--i": i, left: `${j.left}%`, width: j.size, animationDuration: `${j.duration}s`, animationDelay: `${j.delay}s` } as CSSProperties}
        >
          <Jellyfish id={`do-jelly-${i}`} hue={j.hue} />
        </span>
      ))}

      <div className="do-depth-fog" />
    </div>
  );
}
