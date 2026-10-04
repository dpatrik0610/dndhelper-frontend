import type { CSSProperties, ReactNode } from "react";
import type { AoeTemplate, FxKind, GridSettings } from "@appTypes/Tabletop";

/**
 * Animated spell effects, all in one style: a soft radial glow, a bright core in a lighter tint of the
 * effect colour, and a few animated strokes/particles. Area effects are drawn in a unit circle of
 * radius 100 and scaled; line and cone effects are drawn along +x and rotated. Animations live in
 * tabletop.css (fx-* classes) and stop under reduced motion / performance mode.
 */

type FxTemplate = Pick<AoeTemplate, "id" | "kind" | "x" | "y" | "sizeFt" | "widthFt" | "angle" | "color"> & { fx: FxKind };

/** Mix a #rrggbb(aa) colour towards white. */
function tint(hex: string, amount: number) {
  const n = parseInt(hex.slice(1, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix((n >> 16) & 255)} ${mix((n >> 8) & 255)} ${mix(n & 255)})`;
}

/** Small deterministic PRNG so lightning keeps its shape between renders. */
function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

export function FxView({ template: t, grid }: { template: FxTemplate; grid: GridSettings }) {
  const color = t.color.slice(0, 7);
  const light = tint(color, 0.55);
  const len = (t.sizeFt / 5) * grid.cellSize;
  const glow = `fx-${t.id}-glow`;
  const props = { color, light, glow, id: t.id };

  const defs = (
    <defs>
      <radialGradient id={glow}>
        <stop offset="0" stopColor={light} stopOpacity={0.95} />
        <stop offset="0.45" stopColor={color} stopOpacity={0.5} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
  );

  if (t.fx === "Beam" || t.fx === "Ray" || t.fx === "Lightning") {
    const width = ((t.widthFt || 5) / 5) * grid.cellSize;
    return (
      <g className={`fx fx-${t.fx.toLowerCase()}`} transform={`translate(${t.x} ${t.y}) rotate(${t.angle})`}>
        {defs}
        <LineFx kind={t.fx} len={len} width={width} {...props} />
      </g>
    );
  }

  if (t.fx === "Breath") {
    return (
      <g className="fx fx-breath" transform={`translate(${t.x} ${t.y}) rotate(${t.angle})`}>
        {defs}
        <BreathFx len={len} {...props} />
      </g>
    );
  }

  return (
    <g className={`fx fx-${t.fx.toLowerCase()}`} transform={`translate(${t.x} ${t.y}) scale(${len / 100})`}>
      {defs}
      {AREA[t.fx]?.(props)}
    </g>
  );
}

interface Paint {
  color: string;
  light: string;
  glow: string;
  id: string;
}

const ring = (n: number, r: number, offsetDeg = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((i * 360) / n + offsetDeg) * (Math.PI / 180);
    return [Math.cos(a) * r, Math.sin(a) * r] as const;
  });

const FLAME = "M0,0 C-15,-10 -13,-36 0,-60 C13,-36 15,-10 0,0 Z";

const AREA: Partial<Record<FxKind, (p: Paint) => ReactNode>> = {
  Fire: ({ color, light, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} className="fx-breathe" />
      {[[-40, 30, 0.9], [38, 34, 0.85], [0, 45, 1.25], [-22, 12, 1], [24, 10, 1.05], [-55, 52, 0.6], [56, 55, 0.65]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d={FLAME} fill={color} fillOpacity={0.85} className="fx-flicker" style={delay(-i * 0.17)} />
          {/* CSS transforms replace the transform attribute, so animated shapes sit inside positioned groups */}
          <g transform="scale(0.5)">
            <path d={FLAME} fill={light} className="fx-flicker" style={delay(-i * 0.11)} />
          </g>
        </g>
      ))}
      {[[-30, 10], [20, 0], [0, -20], [45, 20], [-50, 25], [10, 30]].map(([x, y], i) => (
        <g key={`e${i}`} transform={`translate(${x} ${y})`}>
          <circle r={3.5} fill={light} className="fx-rise" style={delay(-i * 0.37)} />
        </g>
      ))}
    </>
  ),

  Explosion: ({ color, light, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} opacity={0.6} className="fx-pulse" />
      {[0, 0.6, 1.2].map((d) => (
        <circle key={d} r={95} fill="none" stroke={light} strokeWidth={7} className="fx-shock" style={delay(-d)} />
      ))}
      {ring(8, 1).map(([x, y], i) => (
        <g key={i} transform={`rotate(${(Math.atan2(y, x) * 180) / Math.PI + 90})`}>
          <line x1={0} y1={-34} x2={0} y2={-52} stroke={color} strokeWidth={5} strokeLinecap="round" className="fx-spark" style={delay(-i * 0.15)} />
        </g>
      ))}
      <circle r={30} fill={light} className="fx-pulse" />
    </>
  ),

  Frost: ({ color, light, glow }) => (
    <>
      <circle r={95} fill={`url(#${glow})`} opacity={0.7} className="fx-breathe" />
      <g className="fx-spin-slower">
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 60})`}>
            <path d="M0,-92 L8,-22 L0,0 L-8,-22 Z" fill={light} fillOpacity={0.85} />
            <path d="M0,-62 L-16,-74 M0,-62 L16,-74" stroke={light} strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={`s${i}`} d="M0,-55 L5,-14 L0,0 L-5,-14 Z" fill={color} transform={`rotate(${30 + i * 60})`} />
        ))}
      </g>
      {ring(6, 70, 15).map(([x, y], i) => (
        <g key={`t${i}`} transform={`translate(${x} ${y})`}>
          <path d="M0,-7 L1.5,-1.5 L7,0 L1.5,1.5 L0,7 L-1.5,1.5 L-7,0 L-1.5,-1.5 Z" fill="#fff" className="fx-twinkle" style={delay(-i * 0.3)} />
        </g>
      ))}
    </>
  ),

  Bubble: ({ color, light }) => (
    <>
      <g className="fx-wobble">
        <circle r={94} fill={color} fillOpacity={0.14} stroke={light} strokeWidth={3} strokeOpacity={0.85} />
        <circle r={84} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={10} />
        <path d="M-58,-46 A74,74 0 0 1 8,-82" stroke="#fff" strokeOpacity={0.7} strokeWidth={6} strokeLinecap="round" fill="none" />
        <circle cx={-44} cy={-58} r={6} fill="#fff" opacity={0.65} />
      </g>
      <g className="fx-spin-slow">
        <circle r={94} fill="none" stroke={light} strokeWidth={2.5} strokeOpacity={0.6} strokeDasharray="14 22" />
      </g>
    </>
  ),

  Cloud: ({ color, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} opacity={0.55} />
      {[[-35, -20, 48], [30, -28, 44], [0, 25, 52], [-48, 30, 38], [46, 28, 40], [8, -48, 34]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={r} fill={color} fillOpacity={0.3} className="fx-drift" style={delay(-i * 1.1)} />
        </g>
      ))}
    </>
  ),

  Acid: ({ color, light, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} opacity={0.45} />
      <circle r={90} fill={color} fillOpacity={0.26} stroke={color} strokeOpacity={0.6} strokeWidth={3} className="fx-wobble" />
      {[[-40, -20, 11], [30, -35, 8], [10, 20, 13], [-25, 45, 9], [52, 18, 10], [-60, 15, 7], [0, -55, 9], [35, 55, 7]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={r} fill={light} fillOpacity={0.15} stroke={light} strokeWidth={2.5} className="fx-bubble" style={delay(-i * 0.31)} />
        </g>
      ))}
    </>
  ),

  Darkness: ({ color, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} opacity={0.6} className="fx-breathe" />
      <circle r={88} fill="#05060a" fillOpacity={0.9} />
      <g className="fx-spin">
        {[0, 120, 240].map((r) => (
          <path key={r} d="M0,-78 A78,78 0 0 1 67,39" transform={`rotate(${r})`} fill="none" stroke={color} strokeOpacity={0.45} strokeWidth={4} strokeLinecap="round" />
        ))}
      </g>
      <g className="fx-spin-rev">
        {[60, 180, 300].map((r) => (
          <path key={r} d="M0,-48 A48,48 0 0 1 42,24" transform={`rotate(${r})`} fill="none" stroke={color} strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
        ))}
      </g>
      <circle r={88} fill="none" stroke={color} strokeWidth={3} strokeOpacity={0.75} />
    </>
  ),

  Light: ({ light, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} className="fx-breathe" />
      <g className="fx-spin-slow">
        {Array.from({ length: 12 }, (_, i) => (
          <polygon key={i} points="0,-30 5,-98 -5,-98" fill={light} fillOpacity={i % 2 ? 0.35 : 0.6} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r={26} fill="#fff" fillOpacity={0.85} className="fx-pulse" />
    </>
  ),

  Arcane: ({ color, light, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} opacity={0.45} />
      <circle r={92} fill="none" stroke={color} strokeWidth={3} />
      <g className="fx-spin">
        <circle r={82} fill="none" stroke={light} strokeWidth={2} strokeDasharray="10 8" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-66} x2={0} y2={-76} stroke={light} strokeWidth={3} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <g className="fx-spin-rev">
        <polygon points={ring(3, 60, -90).map((p) => p.join(",")).join(" ")} fill="none" stroke={light} strokeWidth={2.5} />
        <polygon points={ring(3, 60, 90).map((p) => p.join(",")).join(" ")} fill="none" stroke={light} strokeWidth={2.5} />
      </g>
      <circle r={22} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={3} className="fx-pulse" />
    </>
  ),

  Healing: ({ light, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} opacity={0.65} className="fx-breathe" />
      <circle r={70} fill="none" stroke={light} strokeWidth={3} strokeOpacity={0.7} className="fx-shock fx-slow" />
      {[[-40, 30], [35, 40], [0, -5], [-20, 55], [50, -5], [-55, -15], [20, 15]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M-7,0 H7 M0,-7 V7" stroke={light} strokeWidth={4.5} strokeLinecap="round" className="fx-rise" style={delay(-i * 0.4)} />
        </g>
      ))}
    </>
  ),

  Vortex: ({ color, light, glow }) => (
    <>
      <circle r={100} fill={`url(#${glow})`} opacity={0.5} />
      <g className="fx-spin-fast">
        {[0, 90, 180, 270].map((r) => (
          <path key={r} d="M0,0 Q42,-52 96,-12" transform={`rotate(${r})`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeOpacity={0.8} />
        ))}
        {[45, 135, 225, 315].map((r) => (
          <path key={r} d="M0,0 Q32,-40 72,-8" transform={`rotate(${r})`} fill="none" stroke={light} strokeWidth={4} strokeLinecap="round" strokeOpacity={0.7} />
        ))}
      </g>
      <circle r={15} fill="#05060a" stroke={light} strokeWidth={3} />
    </>
  ),
};

function LineFx({ kind, len, width, color, light, id }: { kind: FxKind; len: number; width: number } & Paint) {
  if (kind === "Lightning") {
    const rand = seeded(id);
    const bolts = [0, 1, 2].map(() => {
      const steps = Math.max(4, Math.round(len / (width * 0.9)));
      const pts = Array.from({ length: steps + 1 }, (_, i) => {
        const x = (len * i) / steps;
        const y = i === 0 || i === steps ? 0 : (rand() - 0.5) * width * 1.6;
        return `${x},${y}`;
      });
      return pts.join(" ");
    });
    return (
      <>
        <line x1={0} y1={0} x2={len} y2={0} stroke={color} strokeWidth={width * 1.1} strokeOpacity={0.18} strokeLinecap="round" className="fx-breathe" />
        {bolts.map((pts, i) => (
          <g key={i} className={`fx-flash fx-flash-${i}`}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth={width * 0.45} strokeOpacity={0.45} strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={pts} fill="none" stroke={light} strokeWidth={width * 0.14} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}
        <circle cx={len} r={width * 0.7} fill={color} fillOpacity={0.45} className="fx-pulse" />
      </>
    );
  }

  const ray = kind === "Ray";
  const flow = { "--dash": `${width * 1.8}px` } as CSSProperties;
  return (
    <>
      <line x1={0} y1={0} x2={len} y2={0} stroke={color} strokeWidth={width * (ray ? 0.7 : 1)} strokeOpacity={0.22} strokeLinecap="round" className="fx-breathe" />
      <line x1={0} y1={0} x2={len} y2={0} stroke={color} strokeWidth={width * (ray ? 0.3 : 0.55)} strokeOpacity={0.55} strokeLinecap="round" />
      <line
        x1={0}
        y1={0}
        x2={len}
        y2={0}
        stroke={light}
        strokeWidth={width * (ray ? 0.1 : 0.22)}
        strokeLinecap="round"
        strokeDasharray={ray ? undefined : `${width * 1.2} ${width * 0.6}`}
        className={ray ? undefined : "fx-flow"}
        style={ray ? undefined : flow}
      />
      {ray &&
        [0, 0.35, 0.7, 1.05].map((d) => (
          <circle key={d} r={width * 0.16} fill="#fff" className="fx-travel" style={{ ...delay(-d), "--len": `${len}px` } as CSSProperties} />
        ))}
      <circle r={width * 0.55} fill={light} fillOpacity={0.75} className="fx-pulse" />
      <circle cx={len} r={width * 0.8} fill={color} fillOpacity={0.45} className="fx-pulse" style={delay(-0.4)} />
    </>
  );
}

function BreathFx({ len, color, light, id }: { len: number } & Paint) {
  const clip = `fx-${id}-cone`;
  const fill = `fx-${id}-fade`;
  const cone = `0,0 ${len},${len / 2} ${len},${-len / 2}`;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <polygon points={cone} />
        </clipPath>
        <linearGradient id={fill} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={light} stopOpacity={0.85} />
          <stop offset="0.5" stopColor={color} stopOpacity={0.45} />
          <stop offset="1" stopColor={color} stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <polygon points={cone} fill={`url(#${fill})`} className="fx-breathe-soft" />
      <g clipPath={`url(#${clip})`}>
        {[0, 0.5, 1].map((d) => (
          <circle key={d} r={len} fill="none" stroke={light} strokeWidth={len * 0.05} strokeOpacity={0.7} className="fx-shock" style={delay(-d)} />
        ))}
        {[-14, -5, 6, 15].map((a, i) => (
          <g key={a} transform={`rotate(${a})`}>
            <circle r={len * 0.025} fill="#fff" className="fx-travel" style={{ ...delay(-i * 0.3), "--len": `${len}px` } as CSSProperties} />
          </g>
        ))}
      </g>
    </>
  );
}
