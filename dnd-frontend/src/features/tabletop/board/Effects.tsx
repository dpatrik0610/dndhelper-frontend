import type { CSSProperties, ReactNode } from "react";
import type { AoeTemplate, FxKind, GridSettings } from "@appTypes/Tabletop";
import { fxShape } from "@features/tabletop/tools";

/**
 * Animated spell effects. Each one is drawn in its own unit space and scaled into place, so strokes,
 * filters and particles look the same at any size: area effects in a circle of radius 100, breath in a
 * cone 100 long, line effects across a beam 20 wide. Layers go glow → body → bright core → particles;
 * organic edges come from turbulence displacement ("warp", "churn"), neon edges from "bloom". Scatter is
 * seeded by the template id, so an effect keeps its shape between renders. Animations live in
 * tabletop.css (fx-* classes) and stop under reduced motion; performance mode also drops the filters.
 */

type FxTemplate = Pick<AoeTemplate, "id" | "kind" | "x" | "y" | "sizeFt" | "widthFt" | "angle" | "color"> & { fx: FxKind };

/** Line effects are drawn as if the beam were this many units wide. */
const LINE_W = 20;

/** Mix a #rrggbb colour towards white (to = 255) or black (to = 0). */
function mix(hex: string, to: number, amount: number) {
  const n = parseInt(hex.slice(1, 7), 16);
  const m = (c: number) => Math.round(c + (to - c) * amount);
  return `rgb(${m((n >> 16) & 255)} ${m((n >> 8) & 255)} ${m(n & 255)})`;
}

/** Small deterministic PRNG so effects keep their shape between renders. */
function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function paint(id: string, color: string) {
  const rand = seeded(id);
  const key = `fx-${id.replace(/[^\w-]/g, "")}`;
  return {
    color,
    light: mix(color, 255, 0.5),
    pale: mix(color, 255, 0.82),
    dark: mix(color, 0, 0.6),
    rand,
    seed: Math.floor(rand() * 1000),
    /** Id for one of this effect's defs, and the url() that points at it. */
    ref: (name: string) => `${key}-${name}`,
    url: (name: string) => `url(#${key}-${name})`,
  };
}

type Paint = ReturnType<typeof paint>;

/** Animation timing (a negative delay starts mid-cycle) plus CSS custom properties for the keyframes. */
const anim = (delay: number, duration?: number, vars?: Record<string, string>) =>
  ({ animationDelay: `${delay}s`, animationDuration: duration ? `${duration}s` : undefined, ...vars }) as CSSProperties;

export function FxView({ template: t, grid }: { template: FxTemplate; grid: GridSettings }) {
  const len = (t.sizeFt / 5) * grid.cellSize;
  const p = paint(t.id, t.color.slice(0, 7));
  const at = `translate(${t.x} ${t.y})`;

  if (fxShape(t.fx) === "Line") {
    const width = ((t.widthFt || 5) / 5) * grid.cellSize;
    const L = (len / width) * LINE_W;
    const draw = t.fx === "Lightning" ? lightning : t.fx === "Ray" ? ray : t.fx === "Wind" ? wind : beam;
    return (
      <g className="fx" transform={`${at} rotate(${t.angle}) scale(${width / LINE_W})`}>
        {defs(p, [-40, -40, L + 80, 80])}
        {draw(L, p)}
      </g>
    );
  }

  if (t.fx === "Breath") {
    return (
      <g className="fx" transform={`${at} rotate(${t.angle}) scale(${len / 100})`}>
        {defs(p, [-30, -90, 160, 180])}
        {breath(p)}
      </g>
    );
  }

  return (
    <g className="fx" transform={`${at} scale(${len / 100})`}>
      {defs(p, [-140, -140, 280, 280])}
      {AREA[t.fx]?.(p)}
    </g>
  );
}

/** Shared gradients and filters; filter regions are in the effect's unit space. */
function defs(p: Paint, [x, y, width, height]: number[]) {
  const region = { filterUnits: "userSpaceOnUse" as const, x, y, width, height };
  return (
    <defs>
      <radialGradient id={p.ref("glow")}>
        <stop offset="0" stopColor={p.light} stopOpacity={0.9} />
        <stop offset="0.4" stopColor={p.color} stopOpacity={0.45} />
        <stop offset="1" stopColor={p.color} stopOpacity={0} />
      </radialGradient>
      <radialGradient id={p.ref("puff")}>
        <stop offset="0" stopColor={p.pale} stopOpacity={0.75} />
        <stop offset="0.5" stopColor={p.color} stopOpacity={0.45} />
        <stop offset="1" stopColor={p.color} stopOpacity={0} />
      </radialGradient>
      <radialGradient id={p.ref("smoke")}>
        <stop offset="0" stopColor="#0c0a10" stopOpacity={0.85} />
        <stop offset="0.6" stopColor={p.dark} stopOpacity={0.55} />
        <stop offset="1" stopColor={p.dark} stopOpacity={0} />
      </radialGradient>
      {/* Licking edges for flames and liquids; shapes animating through the still noise make it move. */}
      <filter id={p.ref("warp")} {...region}>
        <feTurbulence type="fractalNoise" baseFrequency={0.045} numOctaves={2} seed={p.seed} />
        <feDisplacementMap in="SourceGraphic" scale={14} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* Big slow billows for smoke, shadow and pools. */}
      <filter id={p.ref("churn")} {...region}>
        <feTurbulence type="fractalNoise" baseFrequency={0.02} numOctaves={3} seed={p.seed} />
        <feDisplacementMap in="SourceGraphic" scale={28} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={p.ref("bloom")} {...region}>
        <feGaussianBlur stdDeviation={3} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={p.ref("soft")} {...region}>
        <feGaussianBlur stdDeviation={5} />
      </filter>
    </defs>
  );
}

const ring = (n: number, r: number, offsetDeg = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((i * 360) / n + offsetDeg) * (Math.PI / 180);
    return [Math.cos(a) * r, Math.sin(a) * r];
  });

/** n points spread evenly over a disc of radius r (sunflower pattern), nudged by the seed. */
const scatter = (rand: () => number, n: number, r: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = r * Math.sqrt((i + 0.5) / n) * (0.85 + rand() * 0.15);
    const a = i * 2.39996 + rand() * 0.6;
    return [Math.cos(a) * d, Math.sin(a) * d];
  });

const points = (list: number[][]) => list.map((q) => q.join(",")).join(" ");

/** n wandering lines from near the centre out to the edge, for cracks and veins. */
const cracks = (rand: () => number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    let a = (i / n) * Math.PI * 2 + rand() * 0.5;
    return Array.from({ length: 5 }, (_, j) => {
      a += (rand() - 0.5) * 0.35;
      return [Math.cos(a) * (18 + j * 16), Math.sin(a) * (18 + j * 16)];
    });
  });

const FLAME =
  "M0,0 C-14,0 -20,-12 -16,-26 C-13,-38 -4,-44 -3,-60 C4,-52 6,-44 4,-36 C10,-42 12,-50 11,-56 C20,-44 22,-28 16,-14 C12,-4 7,0 0,0 Z";
const SPARKLE = "M0,-7 L1.5,-1.5 L7,0 L1.5,1.5 L0,7 L-1.5,1.5 L-7,0 L-1.5,-1.5 Z";

/** A made-up rune: a stem plus two or three strokes between points of a small lattice. */
function rune(rand: () => number) {
  const pt = () => `${Math.floor(rand() * 3) * 3 - 3},${Math.floor(rand() * 4) * 3 - 4.5}`;
  let d = "M0,-4.5 V4.5";
  for (let i = 2 + Math.floor(rand() * 2); i > 0; i--) d += ` M${pt()} L${pt()}`;
  return d;
}

/** A sickle-shaped spiral arm from the eye out to r; outer parts trail behind a clockwise spin. */
function arm(start: number, turn: number, r: number) {
  const edge = (side: number) =>
    Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      const a = start - turn * t + side * 0.55 * Math.sin(Math.PI * t) * (1 - t / 2);
      const d = 10 + (r - 10) * t;
      return `${Math.cos(a) * d},${Math.sin(a) * d}`;
    });
  return `M${[...edge(0), ...edge(1).reverse()].join(" L")} Z`;
}

/** Sparks flying outward from the centre. */
const sparks = (p: Paint, n: number, from: number, distance: number, color = p.pale) =>
  Array.from({ length: n }, (_, i) => (
    <g key={`spark${i}`} transform={`rotate(${(i * 360) / n + p.rand() * 20})`}>
      <line
        y1={-from}
        y2={-from - distance * 0.3}
        stroke={color}
        strokeWidth={distance * 0.06 + p.rand() * 1.2}
        strokeLinecap="round"
        className="fx-spark"
        style={anim(-p.rand(), 0.7 + p.rand() * 0.5, { "--d": `${distance}px` })}
      />
    </g>
  ));

const AREA: Partial<Record<FxKind, (p: Paint) => ReactNode>> = {
  Fire: (p) => (
    <>
      <circle r={100} fill={p.url("glow")} className="fx-breathe" />
      <circle r={80} fill={p.dark} fillOpacity={0.45} filter={p.url("churn")} />
      <g filter={p.url("warp")}>
        {scatter(p.rand, 18, 66)
          .sort((a, b) => a[1] - b[1])
          .map(([x, y], i) => {
            const s = (0.6 + p.rand() * 0.45) * (1.3 - Math.hypot(x, y) / 110);
            const t = 0.55 + p.rand() * 0.45;
            // CSS transforms replace the transform attribute, so animated shapes sit inside positioned groups
            return (
              <g key={i} transform={`translate(${x} ${y + 24 * s}) scale(${s})`}>
                <path d={FLAME} fill={p.color} fillOpacity={0.92} className="fx-flicker" style={anim(-p.rand(), t)} />
                <g transform="translate(0 -3) scale(0.68)">
                  <path d={FLAME} fill={p.light} className="fx-flicker" style={anim(-p.rand(), t * 0.9)} />
                </g>
                <g transform="translate(0 -2) scale(0.36)">
                  <path d={FLAME} fill="#fffbe8" className="fx-flicker" style={anim(-p.rand(), t * 0.8)} />
                </g>
              </g>
            );
          })}
      </g>
      {scatter(p.rand, 14, 70).map(([x, y], i) => (
        <g key={`e${i}`} transform={`translate(${x} ${y})`}>
          <circle
            r={1.2 + p.rand() * 1.8}
            fill={i % 3 ? p.light : "#fff"}
            className="fx-ember"
            style={anim(-p.rand() * 3, 2 + p.rand() * 1.5, { "--dx": `${(p.rand() - 0.5) * 36}px` })}
          />
        </g>
      ))}
    </>
  ),

  Explosion: (p) => (
    <>
      <circle r={100} fill={p.url("glow")} className="fx-pulse" />
      <g filter={p.url("churn")}>
        <g className="fx-spin-slow">
          {ring(12, 74, p.rand() * 30).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={24 + p.rand() * 10} fill={p.url("smoke")} />
          ))}
        </g>
      </g>
      {[0, 0.9].map((d) => (
        <circle key={d} r={96} fill="none" stroke={p.pale} strokeWidth={6} className="fx-shock" style={anim(-d)} />
      ))}
      <g filter={p.url("warp")}>
        <g className="fx-pulse">
          {scatter(p.rand, 9, 34).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={22 + p.rand() * 12} fill={p.color} />
          ))}
          {scatter(p.rand, 6, 20).map(([x, y], i) => (
            <circle key={`l${i}`} cx={x} cy={y} r={16 + p.rand() * 8} fill={p.light} />
          ))}
          <circle r={15} fill="#fff" />
        </g>
      </g>
      {sparks(p, 14, 40, 55)}
    </>
  ),

  Frost: (p) => {
    const rim = Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2;
      const r = i % 2 ? 80 + p.rand() * 6 : 88 + p.rand() * 8;
      return [Math.cos(a) * r, Math.sin(a) * r];
    });
    return (
      <>
        <circle r={100} fill={p.url("glow")} opacity={0.6} className="fx-breathe" />
        <polygon points={points(rim)} fill={p.pale} fillOpacity={0.14} stroke={p.pale} strokeOpacity={0.75} strokeWidth={1.5} strokeLinejoin="round" />
        {cracks(p.rand, 7).map((c, i) => (
          <polyline key={i} points={points(c)} fill="none" stroke={p.pale} strokeOpacity={0.45} strokeWidth={1.2} strokeLinejoin="round" />
        ))}
        {Array.from({ length: 14 }, (_, i) => {
          const h = 12 + p.rand() * 16;
          return (
            <path
              key={`c${i}`}
              d={`M-5,-62 L0,${-62 - h} L5,-62 L0,-57 Z`}
              transform={`rotate(${i * (360 / 14) + p.rand() * 14})`}
              fill={p.light}
              fillOpacity={0.55}
              stroke={p.pale}
              strokeWidth={1}
            />
          );
        })}
        <g filter={p.url("bloom")}>
          <g className="fx-spin-slower">
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i} transform={`rotate(${i * 60})`}>
                <path
                  d="M0,-8 V-46 M0,-18 L-9,-27 M0,-18 L9,-27 M0,-31 L-7,-38 M0,-31 L7,-38"
                  stroke={p.pale}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                />
                <path d="M0,0 L4,-12 L0,-24 L-4,-12 Z" fill={p.light} />
              </g>
            ))}
            <polygon points={points(ring(6, 9, 30))} fill="none" stroke="#fff" strokeWidth={2} />
          </g>
        </g>
        {scatter(p.rand, 16, 85).map(([x, y], i) => (
          <g key={`s${i}`} transform={`translate(${x} ${y})`}>
            <circle
              r={1 + p.rand() * 1.6}
              fill="#fff"
              className="fx-fall"
              style={anim(-p.rand() * 5, 4 + p.rand() * 3, { "--dx": `${(p.rand() - 0.5) * 20}px` })}
            />
          </g>
        ))}
        {ring(7, 60, p.rand() * 50).map(([x, y], i) => (
          <g key={`t${i}`} transform={`translate(${x} ${y})`}>
            <path d={SPARKLE} fill="#fff" className="fx-twinkle" style={anim(-i * 0.3)} />
          </g>
        ))}
      </>
    );
  },

  Bubble: (p) => (
    <>
      <defs>
        <radialGradient id={p.ref("shell")}>
          <stop offset="0" stopColor={p.color} stopOpacity={0.04} />
          <stop offset="0.7" stopColor={p.color} stopOpacity={0.12} />
          <stop offset="0.93" stopColor={p.light} stopOpacity={0.45} />
          <stop offset="1" stopColor={p.pale} stopOpacity={0.85} />
        </radialGradient>
        <linearGradient id={p.ref("iris")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0abfc" stopOpacity={0.7} />
          <stop offset="0.35" stopColor={p.light} />
          <stop offset="0.65" stopColor="#67e8f9" stopOpacity={0.7} />
          <stop offset="1" stopColor="#fde68a" stopOpacity={0.6} />
        </linearGradient>
      </defs>
      <circle r={100} fill={p.url("glow")} opacity={0.25} />
      <g className="fx-wobble">
        <circle r={94} fill={p.url("shell")} />
        <g className="fx-spin-slow">
          <circle r={89} fill="none" stroke={p.url("iris")} strokeWidth={6} strokeOpacity={0.5} />
        </g>
        <circle r={94} fill="none" stroke={p.pale} strokeWidth={1.5} strokeOpacity={0.9} />
        <path d="M-64,-38 A75,75 0 0 1 -8,-74" stroke="#fff" strokeOpacity={0.75} strokeWidth={7} strokeLinecap="round" fill="none" filter={p.url("bloom")} />
        <ellipse cx={-36} cy={-60} rx={9} ry={5} transform="rotate(-35 -36 -60)" fill="#fff" opacity={0.85} />
        <path d="M46,64 A78,78 0 0 0 72,32" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" fill="none" />
      </g>
      {[0, 120, 240].map((a, i) => (
        <circle key={a} r={2.2} fill="#fff" fillOpacity={0.8} className="fx-orbit" style={anim(0, 9 + i * 3, { "--a": `${a}deg`, "--r": `${70 + i * 8}px` })} />
      ))}
    </>
  ),

  Cloud: (p) => {
    const puff = ([x, y]: number[], i: number) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <circle r={30 + p.rand() * 14} fill={p.url("puff")} className="fx-drift" style={anim(-p.rand() * 6, 5 + p.rand() * 3)} />
      </g>
    );
    const puffs = scatter(p.rand, 14, 58);
    return (
      <>
        <circle r={100} fill={p.url("glow")} opacity={0.35} />
        <g filter={p.url("churn")}>
          <circle r={72} fill={p.color} fillOpacity={0.22} />
          <g className="fx-spin" style={anim(0, 70)}>
            {puffs.slice(0, 7).map(puff)}
          </g>
          <g className="fx-spin-rev" style={anim(0, 50)}>
            {puffs.slice(7).map(puff)}
          </g>
        </g>
      </>
    );
  },

  Acid: (p) => (
    <>
      <defs>
        <radialGradient id={p.ref("pool")} cx="0.42" cy="0.38" r="0.62">
          <stop offset="0" stopColor={p.light} stopOpacity={0.65} />
          <stop offset="0.45" stopColor={p.color} stopOpacity={0.55} />
          <stop offset="1" stopColor={p.dark} stopOpacity={0.75} />
        </radialGradient>
      </defs>
      <circle r={100} fill={p.url("glow")} opacity={0.35} />
      <g filter={p.url("churn")}>
        <g className="fx-wobble">
          <circle r={82} fill={p.url("pool")} stroke={p.light} strokeWidth={2.5} strokeOpacity={0.7} />
        </g>
      </g>
      <ellipse cx={-30} cy={-42} rx={26} ry={9} transform="rotate(-30 -30 -42)" fill="#fff" fillOpacity={0.18} />
      {scatter(p.rand, 13, 66).map(([x, y], i) => {
        const r = 3 + p.rand() * 7;
        const timing = anim(-p.rand() * 2.6, 2.2 + p.rand() * 1.2);
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r={r} fill={p.light} fillOpacity={0.2} stroke={p.pale} strokeWidth={1.5} className="fx-bubble" style={timing} />
            <circle r={r} fill="none" stroke={p.pale} strokeWidth={1} className="fx-pop" style={timing} />
          </g>
        );
      })}
      {scatter(p.rand, 5, 50).map(([x, y], i) => (
        <g key={`f${i}`} transform={`translate(${x} ${y})`}>
          <ellipse rx={10} ry={16} fill={p.color} fillOpacity={0.3} filter={p.url("soft")} className="fx-rise" style={anim(-p.rand() * 4, 4)} />
        </g>
      ))}
    </>
  ),

  Darkness: (p) => (
    <>
      <circle r={100} fill={p.url("glow")} opacity={0.55} className="fx-breathe" />
      <g filter={p.url("churn")}>
        <circle r={84} fill="#06050b" fillOpacity={0.94} />
        {/* Smoke billowing off the edge, turning slowly through the noise */}
        <g className="fx-spin" style={anim(0, 30)}>
          {ring(14, 82, p.rand() * 30).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={14 + p.rand() * 10} fill={p.url("smoke")} />
          ))}
        </g>
        <circle r={84} fill="none" stroke={p.color} strokeWidth={2} strokeOpacity={0.55} />
      </g>
      <g filter={p.url("soft")} fill="none" strokeLinecap="round">
        <g className="fx-spin-rev" style={anim(0, 14)}>
          {[0, 120, 240].map((r) => (
            <path key={r} d="M0,-62 A62,62 0 0 1 54,31" transform={`rotate(${r})`} stroke={p.color} strokeOpacity={0.55} strokeWidth={6} />
          ))}
        </g>
        <g className="fx-spin" style={anim(0, 9)}>
          {[60, 180, 300].map((r) => (
            <path key={r} d="M0,-36 A36,36 0 0 1 31,18" transform={`rotate(${r})`} stroke={p.light} strokeOpacity={0.35} strokeWidth={4} />
          ))}
        </g>
      </g>
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          r={1.2 + p.rand()}
          fill={p.light}
          className="fx-spiral"
          style={anim(-p.rand() * 3, 2.6 + p.rand(), { "--a": `${i * 36}deg`, "--r": `${70 + p.rand() * 20}px` })}
        />
      ))}
    </>
  ),

  Light: (p) => (
    <>
      <defs>
        <radialGradient id={p.ref("ray")} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={100}>
          <stop offset="0.1" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="0.4" stopColor={p.light} stopOpacity={0.55} />
          <stop offset="1" stopColor={p.light} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={100} fill={p.url("glow")} className="fx-breathe" />
      <g className="fx-spin-slow">
        {Array.from({ length: 12 }, (_, i) => (
          <polygon key={i} points="0,0 7,-100 -7,-100" transform={`rotate(${i * 30})`} fill={p.url("ray")} opacity={i % 2 ? 0.55 : 0.9} />
        ))}
      </g>
      <g className="fx-spin-rev">
        {Array.from({ length: 10 }, (_, i) => (
          <polygon key={i} points="0,0 3,-80 -3,-80" transform={`rotate(${i * 36 + 18})`} fill={p.url("ray")} />
        ))}
      </g>
      <circle r={48} fill="none" stroke={p.pale} strokeOpacity={0.4} strokeWidth={1.5} className="fx-breathe" />
      <g filter={p.url("bloom")}>
        <circle r={22} fill="#fff" className="fx-pulse" />
      </g>
      {scatter(p.rand, 10, 85).map(([x, y], i) => (
        <g key={`s${i}`} transform={`translate(${x} ${y}) scale(${0.5 + p.rand() * 0.6})`}>
          <path d={SPARKLE} fill="#fff" className="fx-twinkle" style={anim(-p.rand() * 1.8, 1.4 + p.rand())} />
        </g>
      ))}
    </>
  ),

  Arcane: (p) => {
    const star = ring(7, 60, -90);
    return (
      <>
        <circle r={100} fill={p.url("glow")} opacity={0.45} className="fx-breathe" />
        <g filter={p.url("bloom")} fill="none" stroke={p.light} strokeLinecap="round" strokeLinejoin="round">
          <circle r={95} strokeWidth={2.5} />
          <circle r={89} strokeWidth={1} strokeOpacity={0.7} />
          <g className="fx-spin" style={anim(0, 40)}>
            <circle r={80} strokeWidth={1.2} />
            <circle r={66} strokeWidth={1.2} />
            {Array.from({ length: 20 }, (_, i) => (
              <path key={i} d={rune(p.rand)} transform={`rotate(${i * 18}) translate(0 -73)`} stroke={p.pale} strokeWidth={1.3} />
            ))}
          </g>
          <g className="fx-spin-rev" style={anim(0, 24)}>
            <polygon points={points(star.map((_, i) => star[(i * 3) % 7]))} strokeWidth={1.8} />
            <circle r={38} strokeWidth={1.5} />
          </g>
          <g className="fx-spin" style={anim(0, 12)}>
            <rect x={-22} y={-22} width={44} height={44} strokeWidth={1.4} strokeOpacity={0.8} />
            <rect x={-22} y={-22} width={44} height={44} strokeWidth={1.4} strokeOpacity={0.8} transform="rotate(45)" />
          </g>
          <circle r={10} fill={p.pale} stroke="none" className="fx-pulse" />
        </g>
        {[0, 120, 240].map((a) => (
          <circle key={a} r={3} fill="#fff" className="fx-orbit" style={anim(0, 6, { "--a": `${a}deg`, "--r": "92px" })} />
        ))}
        {scatter(p.rand, 8, 40).map(([x, y], i) => (
          <g key={`m${i}`} transform={`translate(${x} ${y})`}>
            <circle r={1.6} fill={p.pale} className="fx-ember" style={anim(-p.rand() * 3, 2.5 + p.rand(), { "--dx": "0px" })} />
          </g>
        ))}
      </>
    );
  },

  Healing: (p) => (
    <>
      <defs>
        <linearGradient id={p.ref("streak")} gradientUnits="userSpaceOnUse" x1={0} y1={-26} x2={0} y2={0}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor={p.light} stopOpacity={0} />
        </linearGradient>
      </defs>
      <circle r={100} fill={p.url("glow")} opacity={0.65} className="fx-breathe" />
      {[0, 1, 2].map((i) => (
        <circle key={i} r={92} fill="none" stroke={p.light} strokeWidth={2.5} className="fx-shock fx-slow" style={anim(-i)} />
      ))}
      <g className="fx-spin-slower">
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d="M0,-10 C-16,-26 -12,-50 0,-62 C12,-50 16,-26 0,-10 Z"
            transform={`rotate(${i * 45 + 22.5})`}
            fill={p.light}
            fillOpacity={0.12}
            stroke={p.pale}
            strokeOpacity={0.45}
            strokeWidth={1.2}
          />
        ))}
      </g>
      <g filter={p.url("bloom")}>
        <circle r={14} fill={p.pale} fillOpacity={0.8} className="fx-pulse" />
        {scatter(p.rand, 6, 60).map(([x, y], i) => (
          <g key={`l${i}`} transform={`translate(${x} ${y})`}>
            <line y1={-26} stroke={p.url("streak")} strokeWidth={2.5} strokeLinecap="round" className="fx-rise" style={anim(-p.rand() * 2.4, 2.4 + p.rand())} />
          </g>
        ))}
        {scatter(p.rand, 6, 62).map(([x, y], i) => (
          <g key={`c${i}`} transform={`translate(${x} ${y})`}>
            <path d="M-6,0 H6 M0,-6 V6" stroke={p.pale} strokeWidth={4} strokeLinecap="round" className="fx-rise" style={anim(-p.rand() * 2.2, 2.6 + p.rand())} />
          </g>
        ))}
      </g>
      {scatter(p.rand, 14, 80).map(([x, y], i) => (
        <g key={`m${i}`} transform={`translate(${x} ${y})`}>
          <circle
            r={1 + p.rand() * 1.4}
            fill={i % 2 ? "#fff" : p.pale}
            className="fx-ember"
            style={anim(-p.rand() * 3, 2.5 + p.rand() * 1.5, { "--dx": `${(p.rand() - 0.5) * 20}px` })}
          />
        </g>
      ))}
    </>
  ),

  Vortex: (p) => (
    <>
      <circle r={100} fill={p.url("glow")} opacity={0.5} />
      <g filter={p.url("warp")}>
        <g className="fx-spin" style={anim(0, 6)}>
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d={arm((i * 2 * Math.PI) / 5, 4, 98)} fill={p.color} fillOpacity={0.55} />
          ))}
        </g>
      </g>
      <g className="fx-spin" style={anim(0, 3.2)}>
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={arm((i * Math.PI) / 2 + 0.6, 3.4, 74)} fill={p.light} fillOpacity={0.5} />
        ))}
      </g>
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={i}
          r={1.5 + p.rand() * 1.5}
          fill={i % 2 ? p.pale : p.light}
          className="fx-spiral"
          style={anim(-p.rand() * 3, 2.2 + p.rand() * 1.4, { "--a": `${p.rand() * 360}deg`, "--r": `${70 + p.rand() * 30}px` })}
        />
      ))}
      <circle r={22} fill={p.url("glow")} />
      <circle r={11} fill="#05060a" stroke={p.pale} strokeWidth={2} filter={p.url("bloom")} />
    </>
  ),

  Thunder: (p) => {
    // Six sound-wave arcs between the spokes of a hexagon, expanding with the rings.
    const arcs = Array.from({ length: 6 }, (_, i) => {
      const [a, b] = [i * 60 + 10, i * 60 + 50].map((d) => (d * Math.PI) / 180);
      return `M${Math.cos(a) * 80},${Math.sin(a) * 80} A80,80 0 0 1 ${Math.cos(b) * 80},${Math.sin(b) * 80}`;
    }).join(" ");
    return (
      <>
        <circle r={100} fill={p.url("glow")} opacity={0.5} className="fx-pulse" />
        {cracks(p.rand, 6).map((c, i) => (
          <polyline key={`c${i}`} points={points(c)} fill="none" stroke={p.dark} strokeOpacity={0.6} strokeWidth={2} strokeLinejoin="round" />
        ))}
        <g filter={p.url("warp")} fill="none">
          {[0, 0.45, 0.9, 1.35].map((d) => (
            <circle key={d} r={95} stroke={p.light} strokeWidth={7} strokeOpacity={0.8} className="fx-shock" style={anim(-d)} />
          ))}
        </g>
        <g fill="none" stroke={p.pale} strokeWidth={3} strokeLinecap="round">
          {[0, 0.55].map((d) => (
            <path key={d} d={arcs} className="fx-shock" style={anim(-d, 1.1)} />
          ))}
        </g>
        {sparks(p, 16, 30, 60, p.light)}
        <g filter={p.url("bloom")}>
          <circle r={16} fill={p.pale} className="fx-pulse" />
        </g>
      </>
    );
  },

  Necrotic: (p) => (
    <>
      <circle r={100} fill={p.url("glow")} opacity={0.5} className="fx-breathe" />
      <g filter={p.url("churn")}>
        <circle r={80} fill="#0a0507" fillOpacity={0.85} />
        <circle r={80} fill="none" stroke={p.color} strokeWidth={2.5} strokeOpacity={0.7} />
      </g>
      <g filter={p.url("bloom")} fill="none" stroke={p.color} strokeLinecap="round" strokeLinejoin="round">
        {cracks(p.rand, 9).map((c, i) => (
          <polyline key={i} points={points(c)} strokeWidth={1.6} strokeOpacity={0.85} className="fx-breathe-soft" style={anim(-i * 0.3)} />
        ))}
      </g>
      {/* Ghostly flames rising off the dead ground */}
      {scatter(p.rand, 7, 58).map(([x, y], i) => (
        <g key={`w${i}`} transform={`translate(${x} ${y}) scale(${0.35 + p.rand() * 0.2})`}>
          <path d={FLAME} fill={p.pale} fillOpacity={0.35} className="fx-rise" style={anim(-p.rand() * 3, 3 + p.rand())} />
        </g>
      ))}
      <g filter={p.url("bloom")} className="fx-breathe">
        <path
          d="M0,-30 C-20,-30 -26,-14 -24,0 C-23,8 -18,12 -16,16 L-16,24 L16,24 L16,16 C18,12 23,8 24,0 C26,-14 20,-30 0,-30 Z"
          fill={p.pale}
          fillOpacity={0.55}
        />
        <g fill="#0a0507">
          <ellipse cx={-9} rx={6} ry={7} />
          <ellipse cx={9} rx={6} ry={7} />
          <path d="M0,7 L-3,13 L3,13 Z" />
        </g>
        <path d="M-9,18 V24 M-3,18 V24 M3,18 V24 M9,18 V24" stroke="#0a0507" strokeWidth={1.6} />
        <circle cx={-9} cy={1} r={2} fill={p.light} />
        <circle cx={9} cy={1} r={2} fill={p.light} />
      </g>
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={`m${i}`}
          r={1.2 + p.rand()}
          fill={p.light}
          className="fx-spiral"
          style={anim(-p.rand() * 3, 2.6 + p.rand(), { "--a": `${i * 36}deg`, "--r": `${75 + p.rand() * 20}px` })}
        />
      ))}
    </>
  ),

  Web: (p) => {
    const spokes = Array.from({ length: 12 }, (_, i) => ((i + (p.rand() - 0.5) * 0.4) / 12) * Math.PI * 2);
    const at = (a: number, r: number) => `${Math.cos(a) * r},${Math.sin(a) * r}`;
    // Each ring of thread sags towards the hub between two spokes.
    const threads = [16, 27, 38, 49, 60, 71, 82, 92].map((r) => {
      const radii = spokes.map(() => r * (0.94 + p.rand() * 0.1));
      return spokes
        .map((a, i) => {
          const j = (i + 1) % spokes.length;
          const b = spokes[j] + (j === 0 ? Math.PI * 2 : 0);
          return `M${at(a, radii[i])} Q${at((a + b) / 2, ((radii[i] + radii[j]) / 2) * 0.86)} ${at(b, radii[j])}`;
        })
        .join(" ");
    });
    return (
      <>
        <circle r={100} fill={p.url("glow")} opacity={0.2} />
        <g className="fx-wobble" fill="none" stroke={p.pale} strokeLinecap="round">
          {spokes.map((a, i) => (
            <path key={i} d={`M0,0 L${at(a, 98)}`} strokeWidth={1.4} strokeOpacity={0.85} />
          ))}
          {threads.map((d, i) => (
            <path key={`t${i}`} d={d} strokeWidth={1} strokeOpacity={0.7} />
          ))}
          <circle r={4} fill={p.pale} />
        </g>
        {Array.from({ length: 10 }, (_, i) => {
          const a = spokes[Math.floor(p.rand() * spokes.length)];
          const r = 20 + p.rand() * 70;
          return <circle key={`d${i}`} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={1.8} fill="#fff" className="fx-twinkle" style={anim(-p.rand() * 1.8, 1.6 + p.rand())} />;
        })}
      </>
    );
  },

  Entangle: (p) => {
    // Vines reach in from the edge and curl up at the tip; thorns and leaves sit along them.
    const vines = Array.from({ length: 9 }, (_, i) => {
      const a0 = (i / 9) * Math.PI * 2 + p.rand() * 0.4;
      const dir = p.rand() < 0.5 ? -1 : 1;
      const sweep = dir * (1.4 + p.rand() * 0.8);
      const end = 14 + p.rand() * 24;
      return Array.from({ length: 22 }, (_, j) => {
        const t = j / 21;
        const curl = Math.max(0, t - 0.75) * 4;
        const a = a0 + sweep * t + dir * curl * curl * 2.5;
        const r = 92 - (92 - end) * t - curl * 6;
        return [Math.cos(a) * r, Math.sin(a) * r];
      });
    });
    return (
      <>
        <circle r={100} fill={p.url("glow")} opacity={0.3} />
        <circle r={86} fill={p.dark} fillOpacity={0.5} filter={p.url("churn")} />
        {vines.map((v, i) => (
          <g key={i} className="fx-sway" style={anim(-p.rand() * 4, 3.5 + p.rand() * 2)}>
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={points(v.slice(0, 12))} stroke={p.dark} strokeWidth={7} />
              <polyline points={points(v)} stroke={p.color} strokeWidth={3.5} />
              <polyline points={points(v)} stroke={p.light} strokeWidth={1} strokeOpacity={0.6} />
            </g>
            {v.slice(1, -3).map(([x, y], j) => {
              if (j % 3 === 2) return null;
              const [nx, ny] = v[j + 2];
              const [px, py] = v[j];
              const deg = (Math.atan2(ny - py, nx - px) * 180) / Math.PI + (j % 2 ? 90 : -90);
              return j % 3 === 0 ? (
                <path key={j} d="M-2.5,0 L0,-7 L2.5,0 Z" transform={`translate(${x} ${y}) rotate(${deg + 90})`} fill={p.pale} />
              ) : (
                <path key={j} d="M0,0 C4,-4 10,-4 14,0 C10,4 4,4 0,0 Z" transform={`translate(${x} ${y}) rotate(${deg})`} fill={p.light} fillOpacity={0.85} />
              );
            })}
          </g>
        ))}
        {scatter(p.rand, 8, 75).map(([x, y], i) => (
          <g key={`m${i}`} transform={`translate(${x} ${y})`}>
            <circle r={1.3} fill={p.pale} className="fx-ember" style={anim(-p.rand() * 3, 3 + p.rand() * 1.5, { "--dx": `${(p.rand() - 0.5) * 24}px` })} />
          </g>
        ))}
      </>
    );
  },
};

/** Midpoint displacement: a jagged path from a to b (a itself left out); each split nudges the middle sideways. */
function bolt(rand: () => number, [x1, y1]: number[], [x2, y2]: number[], depth: number, rough: number): number[][] {
  if (depth === 0) return [[x2, y2]];
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const off = (rand() - 0.5) * Math.min(len * rough, 36);
  const m = [(x1 + x2) / 2 - ((y2 - y1) / len) * off, (y1 + y2) / 2 + ((x2 - x1) / len) * off];
  return [...bolt(rand, [x1, y1], m, depth - 1, rough), ...bolt(rand, m, [x2, y2], depth - 1, rough)];
}

function lightning(L: number, p: Paint) {
  const depth = Math.min(7, Math.max(3, Math.ceil(Math.log2(L / 12))));
  // Three bolt shapes take turns, each with two forks.
  const bolts = [0, 1, 2].map(() => {
    const main = [[0, 0], ...bolt(p.rand, [0, 0], [L, 0], depth, 0.5)];
    const forks = [0, 1].map(() => {
      const from = main[Math.floor(main.length * (0.2 + p.rand() * 0.5))];
      const a = (p.rand() < 0.5 ? -1 : 1) * (0.35 + p.rand() * 0.4);
      const reach = Math.min(L * (0.15 + p.rand() * 0.15), 90);
      return [from, ...bolt(p.rand, from, [from[0] + Math.cos(a) * reach, from[1] + Math.sin(a) * reach], Math.max(2, depth - 2), 0.6)];
    });
    return { main: points(main), forks: forks.map(points) };
  });
  return (
    <>
      <line x2={L} stroke={p.color} strokeWidth={30} strokeOpacity={0.18} strokeLinecap="round" filter={p.url("soft")} className="fx-flare" />
      <g filter={p.url("bloom")} fill="none" strokeLinejoin="round" strokeLinecap="round">
        {bolts.map((b, i) => (
          <g key={i} className={`fx-flash fx-flash-${i}`}>
            {b.forks.map((f, j) => (
              <polyline key={j} points={f} stroke={p.light} strokeWidth={2} strokeOpacity={0.75} />
            ))}
            <polyline points={b.main} stroke={p.color} strokeWidth={7} strokeOpacity={0.5} />
            <polyline points={b.main} stroke="#fff" strokeWidth={2.5} />
          </g>
        ))}
      </g>
      <circle r={7} fill={p.pale} filter={p.url("bloom")} className="fx-pulse" />
      <g transform={`translate(${L} 0)`}>
        <circle r={18} fill={p.url("glow")} className="fx-flare" />
        {sparks(p, 7, 6, 16)}
      </g>
    </>
  );
}

function beam(L: number, p: Paint) {
  // Two sine strands (wavelength 40) slide one wavelength per cycle inside a clip, so they loop seamlessly.
  const strand = (s: number) => `M-40,0 q10,${-18 * s} 20,0${" t20,0".repeat(Math.ceil((L + 80) / 20))}`;
  return (
    <>
      <defs>
        <clipPath id={p.ref("clip")}>
          <rect y={-20} width={L} height={40} />
        </clipPath>
      </defs>
      <line x2={L} stroke={p.color} strokeWidth={28} strokeOpacity={0.25} strokeLinecap="round" filter={p.url("soft")} className="fx-breathe-soft" />
      <line x2={L} stroke={p.color} strokeWidth={13} strokeOpacity={0.6} strokeLinecap="round" />
      <g filter={p.url("bloom")} strokeLinecap="round">
        <line x2={L} stroke={p.pale} strokeWidth={5} />
        <line x2={L} stroke="#fff" strokeWidth={2.5} strokeDasharray="22 14" className="fx-flow" style={{ "--dash": "36px" } as CSSProperties} />
        <g clipPath={p.url("clip")} fill="none" strokeWidth={1.6}>
          <g className="fx-slide" style={{ "--len": "40px" } as CSSProperties}>
            <path d={strand(1)} stroke={p.pale} strokeOpacity={0.85} />
            <path d={strand(-1)} stroke={p.light} strokeOpacity={0.7} />
          </g>
        </g>
        <circle r={11} fill={p.pale} className="fx-pulse" />
      </g>
      <circle r={18} fill="none" stroke={p.light} strokeWidth={2} className="fx-shock" style={anim(0, 1.2)} />
      <g transform={`translate(${L} 0)`}>
        <circle r={22} fill={p.url("glow")} className="fx-pulse" />
        <circle r={22} fill="none" stroke={p.pale} strokeWidth={2} className="fx-shock" style={anim(-0.4, 1)} />
        {sparks(p, 8, 8, 20)}
      </g>
    </>
  );
}

function ray(L: number, p: Paint) {
  return (
    <>
      <defs>
        <linearGradient id={p.ref("tail")} gradientUnits="userSpaceOnUse" x1={-50} x2={0} y1={0} y2={0}>
          <stop offset="0" stopColor={p.color} stopOpacity={0} />
          <stop offset="0.7" stopColor={p.light} stopOpacity={0.8} />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
      </defs>
      <line x2={L} stroke={p.color} strokeWidth={10} strokeOpacity={0.2} strokeLinecap="round" filter={p.url("soft")} />
      <line x2={L} stroke={p.light} strokeWidth={1.5} strokeOpacity={0.55} strokeLinecap="round" />
      <g filter={p.url("bloom")}>
        {[0, 1, 2].map((i) => (
          <g key={i} className="fx-travel" style={anim(-i * 0.37, 1.1, { "--len": `${L}px` })}>
            <line x1={-50} stroke={p.url("tail")} strokeWidth={6} strokeLinecap="round" />
            <circle r={4.5} fill="#fff" />
          </g>
        ))}
        <circle r={8} fill={p.light} className="fx-pulse" />
      </g>
      <g transform={`translate(${L} 0)`}>
        <circle r={16} fill={p.url("glow")} className="fx-pulse" />
        {sparks(p, 6, 6, 14)}
      </g>
    </>
  );
}

const GUST = "M-70,0 q17.5,-4 35,0 t35,0";
const CURL = "M-70,0 q17.5,-4 35,0 C-20,3 -6,2 -2,-4 C1,-9 -4,-13 -8,-10 C-11,-8 -9,-4 -5,-4";

function wind(L: number, p: Paint) {
  return (
    <>
      <defs>
        <clipPath id={p.ref("clip")}>
          <rect y={-20} width={L} height={40} />
        </clipPath>
        <linearGradient id={p.ref("gust")} gradientUnits="userSpaceOnUse" x1={-70} x2={0} y1={0} y2={0}>
          <stop offset="0" stopColor={p.color} stopOpacity={0} />
          <stop offset="1" stopColor={p.pale} />
        </linearGradient>
      </defs>
      <line x2={L} stroke={p.color} strokeWidth={22} strokeOpacity={0.12} strokeLinecap="round" filter={p.url("soft")} className="fx-breathe-soft" />
      <g clipPath={p.url("clip")}>
        <g fill="none" strokeLinecap="round" stroke={p.url("gust")}>
          {Array.from({ length: Math.max(6, Math.round(L / 25)) }, (_, i) => (
            <g key={i} transform={`translate(0 ${(p.rand() - 0.5) * 16})`}>
              <path
                d={i % 4 ? GUST : CURL}
                strokeWidth={1.2 + p.rand() * 1.4}
                className="fx-travel"
                style={anim(-p.rand() * 2, 0.9 + p.rand() * 0.8, { "--len": `${L + 70}px` })}
              />
            </g>
          ))}
        </g>
        {Array.from({ length: 10 }, (_, i) => (
          <g key={`d${i}`} transform={`translate(0 ${(p.rand() - 0.5) * 18})`}>
            <circle r={0.8 + p.rand()} fill={p.pale} className="fx-travel" style={anim(-p.rand() * 2, 0.7 + p.rand() * 0.6, { "--len": `${L}px` })} />
          </g>
        ))}
      </g>
    </>
  );
}

function breath(p: Paint) {
  const cone = "0,0 100,50 100,-50";
  return (
    <>
      <defs>
        <clipPath id={p.ref("cone")}>
          <polygon points={cone} />
        </clipPath>
        <linearGradient id={p.ref("fade")}>
          <stop offset="0" stopColor={p.pale} stopOpacity={0.8} />
          <stop offset="0.45" stopColor={p.color} stopOpacity={0.45} />
          <stop offset="1" stopColor={p.color} stopOpacity={0.12} />
        </linearGradient>
      </defs>
      <g clipPath={p.url("cone")}>
        <polygon points={cone} fill={p.url("fade")} className="fx-breathe-soft" />
        <g filter={p.url("warp")}>
          {Array.from({ length: 20 }, (_, i) => (
            <g key={i} transform={`rotate(${(p.rand() - 0.5) * 44})`}>
              <circle
                r={26}
                fill={p.url("puff")}
                className="fx-stream"
                style={anim(-p.rand() * 1.6, 1.2 + p.rand() * 0.6, { "--len": `${85 + p.rand() * 25}px` })}
              />
            </g>
          ))}
        </g>
        {[0, 0.6].map((d) => (
          <circle key={d} r={100} fill="none" stroke={p.pale} strokeWidth={3} strokeOpacity={0.5} className="fx-shock" style={anim(-d, 1.2)} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <g key={`s${i}`} transform={`rotate(${(p.rand() - 0.5) * 40})`}>
            <circle r={1.6} fill="#fff" className="fx-travel" style={anim(-p.rand(), 0.9 + p.rand() * 0.5, { "--len": "100px" })} />
          </g>
        ))}
      </g>
      <circle r={6} fill={p.pale} filter={p.url("bloom")} className="fx-pulse" />
    </>
  );
}
