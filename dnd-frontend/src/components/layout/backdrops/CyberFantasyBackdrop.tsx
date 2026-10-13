import { useMemo, type CSSProperties } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Cyber-Fantasy (the "sunset" key): golden hour over a cloud sea. Sky islands float on emerald aether
 * crystals whose circuit-like ley lines glow through the rock, an arcane ring turns around the setting
 * sun, an airship with an aether engine drifts past and sky lanterns rise.
 *
 * Every layer is its own full-size SVG sharing one viewBox (so they stay aligned), and motion is applied
 * to the layer element itself (bob, drift, fly) so the browser moves a finished layer instead of
 * repainting the scene. Styles in styles/themes/cyber-fantasy.css. Seeded = identical every load.
 */

const W = 1600;
const H = 900;
type Pt = [number, number];
const pts = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const VIEW = `0 0 ${W} ${H}`;

const SUN: Pt = [960, 650];

/** Thin wedge from the sun centre outwards, `spread` degrees wide at the far end. */
function ray(angleDeg: number, len: number, spread: number): string {
  const at = (deg: number): Pt => [SUN[0] + Math.cos((deg * Math.PI) / 180) * len, SUN[1] + Math.sin((deg * Math.PI) / 180) * len];
  return pts([SUN, at(angleDeg - spread / 2), at(angleDeg + spread / 2)]);
}

/** Circle as a clockwise subpath, so many of them (plus a clockwise rect) union under nonzero fill. */
const circle = (cx: number, cy: number, r: number) =>
  `M${(cx - r).toFixed(1)} ${cy.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 1 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 1 ${(-2 * r).toFixed(1)} 0`;

/** A puffy cloud bank: overlapping circles along `baseY`, filled solid below it. Wider than the view so drifting never shows an edge. */
function cloudBank(r: () => number, baseY: number, minR: number, maxR: number): string {
  let d = "";
  for (let x = -320; x < W + 320; ) {
    const rad = minR + r() * (maxR - minR);
    d += circle(x, baseY - rad * (0.3 + r() * 0.35), rad);
    x += rad * (0.8 + r() * 0.5);
  }
  return `${d}M-320 ${baseY}H${W + 320}V${H + 40}H-320Z`;
}

interface IslandCfg {
  x: number;
  y: number;
  w: number;
  depth: number;
  scale: number;
  tower?: boolean;
  falls?: boolean;
}

/** Island in local coordinates: domed top at y≈0, stalactite underside hanging to a tip, a crystal under the tip. */
function buildIsland(r: () => number, { w, depth, x: worldX }: IslandCfg) {
  const n = 16;
  const top: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    top.push([t * w, -Math.sin(Math.PI * t) * 10 - r() * 3 + (i === 0 || i === n ? 5 : 0)]);
  }
  const topY = (x: number) => top[Math.min(n, Math.max(0, Math.round((x / w) * n)))][1];

  // underside, right to left; skewed bell profile, every other point pulled up so it reads as stalactites
  const skew = 0.8 + r() * 0.45;
  const m = 26;
  const under: Pt[] = [];
  for (let i = m - 1; i >= 1; i--) {
    const t = Math.pow(i / m, skew);
    const prof = Math.pow(Math.sin(Math.PI * t), 1.7);
    const jag = i % 2 ? 0.72 + r() * 0.18 : 0.95 + r() * 0.1;
    under.push([(i / m) * w + (r() - 0.5) * 6, 6 + depth * prof * jag]);
  }
  const tip = under.reduce((a, b) => (b[1] > a[1] ? b : a));

  // rock bands following the underside, and a rim of sunlight on the side that faces the sun
  const strata = [0.32, 0.6].map((f) => pts(under.map(([x, y]): Pt => [x, 6 + (y - 6) * f])));
  const sunOnRight = worldX + w / 2 < SUN[0];
  const rim = pts(sunOnRight ? [top[n], ...under.filter(([x]) => x > w * 0.5)] : [...under.filter(([x]) => x < w * 0.5), top[0]]);

  const cap = pts([...top, ...top.slice().reverse().map(([x, y]): Pt => [x, y + 8 + r() * 4])]);

  const trees = Array.from({ length: 3 + Math.floor(r() * 4) }, () => {
    const x = w * (0.08 + r() * 0.84);
    return { x, base: topY(x) + 3, h: 14 + r() * 18, round: r() < 0.35 };
  });

  // circuit traces: up from the crystal, one 45° jog, up again, ending in a node
  const traces = [-1, 0, 1].map((k) => {
    const x0 = tip[0] + k * 5;
    const rise1 = depth * (0.12 + r() * 0.12);
    const jog = (k || (r() < 0.5 ? -1 : 1)) * (10 + r() * 18);
    const rise2 = depth * (0.15 + r() * 0.15);
    const path: Pt[] = [
      [x0, tip[1] - 2],
      [x0, tip[1] - rise1],
      [x0 + jog, tip[1] - rise1 - Math.abs(jog)],
      [x0 + jog, tip[1] - rise1 - Math.abs(jog) - rise2],
    ];
    return { line: pts(path), node: path[3] };
  });

  return {
    body: pts([...top, ...under]),
    cap,
    ridge: pts(top),
    strata,
    rim,
    trees,
    tip,
    traces,
    towerX: w * 0.62,
    towerBase: topY(w * 0.62) + 3,
    fallsX: w * 0.07,
    fallsTop: topY(w * 0.07) + 4,
  };
}

const NEAR: IslandCfg[] = [
  { x: 170, y: 400, w: 420, depth: 220, scale: 1, tower: true, falls: true },
  { x: 1230, y: 380, w: 300, depth: 170, scale: 0.85, falls: true },
];
const FAR: IslandCfg[] = [
  { x: 40, y: 230, w: 220, depth: 110, scale: 0.6 },
  { x: 1420, y: 190, w: 200, depth: 100, scale: 0.55 },
  { x: 690, y: 280, w: 170, depth: 85, scale: 0.45 },
];

type Island = ReturnType<typeof buildIsland>;

function Tree({ t, fill }: { t: Island["trees"][number]; fill: string }) {
  if (t.round) {
    const r = t.h * 0.3;
    return (
      <path
        d={`${circle(t.x - r * 0.7, t.base - r * 0.8, r * 0.75)}${circle(t.x + r * 0.6, t.base - r * 0.7, r * 0.7)}${circle(t.x, t.base - r * 1.4, r)}`}
        fill={fill}
      />
    );
  }
  const { x, base, h } = t;
  return (
    <polygon
      points={pts([[x, base - h], [x - h * 0.18, base - h * 0.55], [x - h * 0.1, base - h * 0.55], [x - h * 0.26, base], [x + h * 0.26, base], [x + h * 0.1, base - h * 0.55], [x + h * 0.18, base - h * 0.55]])}
      fill={fill}
    />
  );
}

function NearIsland({ cfg, isl }: { cfg: IslandCfg; isl: Island }) {
  const [tx, ty] = isl.tip;
  return (
    <g transform={`translate(${cfg.x} ${cfg.y}) scale(${cfg.scale})`}>
      {cfg.falls && (
        <path
          d={`M${isl.fallsX - 2} ${isl.fallsTop}h5l7 ${cfg.depth * 0.8}h-19Z`}
          fill="url(#cf-falls)"
        />
      )}

      {/* aether crystal + its glow */}
      <circle cx={tx} cy={ty + 26} r={46} fill="url(#cf-aether-glow)" />
      <polygon points={pts([[tx, ty - 4], [tx + 8, ty + 10], [tx + 6, ty + 40], [tx, ty + 54], [tx - 6, ty + 40], [tx - 8, ty + 10]])} fill="url(#cf-crystal)" stroke="#a7f3d0" strokeOpacity={0.7} strokeWidth={0.8} />
      <path d={`M${tx} ${ty - 4}V${ty + 54}`} stroke="#ecfdf5" strokeOpacity={0.55} strokeWidth={0.8} />

      <polygon points={isl.body} fill="url(#cf-rock)" />
      {isl.strata.map((s, k) => (
        <polyline key={k} points={s} fill="none" stroke="#f6a96b" strokeOpacity={0.1} strokeWidth={1.2} />
      ))}

      {/* ley lines: a soft wide stroke under a crisp one reads as glow without a filter */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {isl.traces.map((t, k) => (
          <g key={k}>
            <polyline points={t.line} stroke="#34d399" strokeOpacity={0.18} strokeWidth={5} />
            <polyline points={t.line} stroke="#6ee7b7" strokeOpacity={0.85} strokeWidth={1.2} />
            <circle cx={t.node[0]} cy={t.node[1]} r={2.2} fill="#d1fae5" />
          </g>
        ))}
      </g>

      <polyline points={isl.rim} fill="none" stroke="#fbbf24" strokeOpacity={0.55} strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={isl.cap} fill="url(#cf-grass)" />
      <polyline points={isl.ridge} fill="none" stroke="#e9c46a" strokeOpacity={0.6} strokeWidth={1.1} />

      {isl.trees.map((t, k) => (
        <Tree key={k} t={t} fill="#1a2616" />
      ))}

      {cfg.tower && (
        <g>
          <path d={`M${isl.towerX - 9} ${isl.towerBase}L${isl.towerX - 6} ${isl.towerBase - 74}h12l3 74Z`} fill="#24141a" />
          <path d={`M${isl.towerX + 6} ${isl.towerBase - 74}l3 74`} stroke="#fbbf24" strokeOpacity={0.5} />
          <path d={`M${isl.towerX - 11} ${isl.towerBase - 72}h22l-11 -30Z`} fill="#3a1d22" />
          <rect x={isl.towerX - 2} y={isl.towerBase - 58} width={4} height={7} rx={2} fill="#fde68a" />
          <rect x={isl.towerX - 2} y={isl.towerBase - 34} width={4} height={6} rx={2} fill="#fcd34d" fillOpacity={0.8} />
          <circle cx={isl.towerX} cy={isl.towerBase - 108} r={14} fill="url(#cf-aether-glow)" />
          <polygon points={pts([[isl.towerX, isl.towerBase - 116], [isl.towerX + 4, isl.towerBase - 107], [isl.towerX, isl.towerBase - 100], [isl.towerX - 4, isl.towerBase - 107]])} fill="#6ee7b7" />
        </g>
      )}
    </g>
  );
}

function FarIsland({ cfg, isl }: { cfg: IslandCfg; isl: Island }) {
  const [tx, ty] = isl.tip;
  return (
    <g transform={`translate(${cfg.x} ${cfg.y}) scale(${cfg.scale})`}>
      <circle cx={tx} cy={ty + 14} r={30} fill="url(#cf-aether-glow)" opacity={0.7} />
      <polygon points={pts([[tx, ty - 2], [tx + 6, ty + 10], [tx, ty + 34], [tx - 6, ty + 10]])} fill="#6ee7b7" fillOpacity={0.75} />
      <polygon points={isl.body} fill="url(#cf-haze)" />
      <polyline points={isl.rim} fill="none" stroke="#fbbf24" strokeOpacity={0.3} strokeWidth={2} />
      <polygon points={isl.cap} fill="#4a2a34" />
      {isl.trees.map((t, k) => (
        <Tree key={k} t={t} fill="#4a2a34" />
      ))}
    </g>
  );
}

export function CyberFantasyBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(1717);
    const near = NEAR.map((cfg) => ({ cfg, isl: buildIsland(r, cfg) }));
    const far = FAR.map((cfg) => ({ cfg, isl: buildIsland(r, cfg) }));
    const rays = Array.from({ length: 16 }, (_, i) => ({ angle: (360 / 16) * i + r() * 10, spread: 2 + r() * 5 }));
    const stars = Array.from({ length: 70 }, () => {
      const y = r() * 380;
      return { x: r() * W, y, r: 0.5 + r() * 1.1, o: (1 - y / 380) * (0.35 + r() * 0.6) };
    });
    const runes = Array.from({ length: 12 }, (_, i) => (360 / 12) * i);
    const cloudsBack = cloudBank(r, 742, 40, 95);
    const cloudsMid = cloudBank(r, 800, 50, 110);
    const cloudsFront = cloudBank(r, 848, 60, 140);
    const lanterns = Array.from({ length: 12 }, () => ({
      left: 4 + r() * 92,
      size: 7 + r() * 6,
      duration: 24 + r() * 16,
      delay: -r() * 40,
      sway: (r() - 0.5) * 80,
    }));
    return { near, far, rays, stars, runes, cloudsBack, cloudsMid, cloudsFront, lanterns };
  }, []);

  const [sx, sy] = SUN;

  return (
    <div className={`theme-scene cf-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="cf-sky" />

      {/* stars, sun bloom, horizon haze: never moves */}
      <svg className="cf-layer" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="cf-bloom" cx={sx} cy={sy} r={620} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.7" />
            <stop offset="0.25" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="0.6" stopColor="#c2410c" stopOpacity="0.1" />
            <stop offset="1" stopColor="#c2410c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cf-sun">
            <stop offset="0" stopColor="#fffbea" />
            <stop offset="0.55" stopColor="#fde68a" />
            <stop offset="0.85" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        {scene.stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff4dc" opacity={s.o} />
        ))}
        <rect width={W} height={H} fill="url(#cf-bloom)" />
        <circle cx={sx} cy={sy} r={92} fill="url(#cf-sun)" />
      </svg>

      {/* god rays and the arcane ring: turn slowly around the sun */}
      <svg className="cf-layer" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="cf-ray" cx={sx} cy={sy} r={1000} gradientUnits="userSpaceOnUse">
            <stop offset="0.08" stopColor="#ffe3a3" stopOpacity="0.22" />
            <stop offset="0.45" stopColor="#ffd28a" stopOpacity="0.07" />
            <stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="cf-spin cf-spin--rays">
          {scene.rays.map((r, i) => (
            <polygon key={i} points={ray(r.angle, 1000, r.spread)} fill="url(#cf-ray)" />
          ))}
        </g>
        <g className="cf-spin cf-spin--ring" fill="none" stroke="#fde68a">
          <circle cx={sx} cy={sy} r={150} strokeOpacity={0.35} strokeWidth={4} strokeDasharray="1 11" />
          <circle cx={sx} cy={sy} r={178} strokeOpacity={0.22} />
          {scene.runes.map((a) => (
            <path
              key={a}
              transform={`rotate(${a} ${sx} ${sy})`}
              d={`M${sx} ${sy - 186}l5 8-5 8-5-8Z${a % 60 === 0 ? `M${sx - 8} ${sy - 178}h16` : ""}`}
              fill="#fde68a"
              fillOpacity={0.35}
              strokeOpacity={0.4}
              strokeWidth={0.8}
            />
          ))}
        </g>
        <g className="cf-spin cf-spin--ring-rev" fill="none" stroke="#6ee7b7">
          <circle cx={sx} cy={sy} r={214} strokeOpacity={0.2} strokeWidth={1.2} strokeDasharray="70 12 6 12" />
          <circle cx={sx} cy={sy} r={226} strokeOpacity={0.1} strokeDasharray="2 6" />
        </g>
      </svg>

      <svg className="cf-layer cf-bob cf-bob--far" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="cf-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6b3340" />
            <stop offset="1" stopColor="#3b1a2e" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="cf-aether-glow">
            <stop offset="0" stopColor="#6ee7b7" stopOpacity="0.55" />
            <stop offset="0.4" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="1" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>
        {scene.far.map(({ cfg, isl }, i) => (
          <FarIsland key={i} cfg={cfg} isl={isl} />
        ))}
      </svg>

      <svg className="cf-layer cf-drift cf-drift--back" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="cf-cloud-back" cx={sx} cy={sy} r={950} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffe6b0" />
            <stop offset="0.16" stopColor="#f8b26f" />
            <stop offset="0.42" stopColor="#c0614f" />
            <stop offset="1" stopColor="#4d1f3a" />
          </radialGradient>
          {/* rim light: bright where the sun is, fading to a faint edge away from it (also used by the front bank) */}
          <radialGradient id="cf-cloud-rim" cx={sx} cy={sy} r={950} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff3cf" stopOpacity="0.95" />
            <stop offset="0.3" stopColor="#ffcf96" stopOpacity="0.6" />
            <stop offset="1" stopColor="#d4867f" stopOpacity="0.12" />
          </radialGradient>
          <radialGradient id="cf-cloud-mid" cx={sx} cy={sy} r={1050} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f8c08a" />
            <stop offset="0.22" stopColor="#d77a5c" />
            <stop offset="0.55" stopColor="#8e3b4a" />
            <stop offset="1" stopColor="#3d1730" />
          </radialGradient>
        </defs>
        {/* the same bank drawn lighter and nudged up first leaves a sunlit rim along every top edge */}
        <path d={scene.cloudsBack} fill="url(#cf-cloud-rim)" transform="translate(0 -4)" />
        <path d={scene.cloudsBack} fill="url(#cf-cloud-back)" />
        <path d={scene.cloudsMid} fill="url(#cf-cloud-rim)" opacity={0.6} transform="translate(0 -3)" />
        <path d={scene.cloudsMid} fill="url(#cf-cloud-mid)" />
      </svg>

      <svg className="cf-layer cf-bob cf-bob--near" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="cf-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a3026" />
            <stop offset="0.45" stopColor="#2e1720" />
            <stop offset="1" stopColor="#170b14" />
          </linearGradient>
          <linearGradient id="cf-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a7a2c" />
            <stop offset="1" stopColor="#2b3418" />
          </linearGradient>
          <linearGradient id="cf-falls" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff1d6" stopOpacity="0.6" />
            <stop offset="0.35" stopColor="#fcd9a8" stopOpacity="0.2" />
            <stop offset="1" stopColor="#fcd9a8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cf-crystal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d1fae5" />
            <stop offset="0.45" stopColor="#34d399" />
            <stop offset="1" stopColor="#065f46" />
          </linearGradient>
        </defs>
        {scene.near.map(({ cfg, isl }, i) => (
          <NearIsland key={i} cfg={cfg} isl={isl} />
        ))}
      </svg>

      {/* airship: own little SVG flown across the viewport; the aether engine glows emerald */}
      <svg className="cf-airship" viewBox="-110 -40 220 100" aria-hidden>
        <defs>
          <linearGradient id="cf-envelope" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a3f2a" />
            <stop offset="0.5" stopColor="#3d1d1f" />
            <stop offset="1" stopColor="#1e0d15" />
          </linearGradient>
          <radialGradient id="cf-engine">
            <stop offset="0" stopColor="#d1fae5" />
            <stop offset="0.35" stopColor="#34d399" stopOpacity="0.7" />
            <stop offset="1" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="cf-airship__bob">
          <path d="M-70 -4L-98 -24L-92 -2ZM-70 4L-98 22L-92 2Z" fill="#2a1418" />
          <path d="M-30 18L-20 34M30 18L20 34M0 21V34" stroke="#c08457" strokeOpacity={0.7} strokeWidth={0.8} />
          <ellipse cx={0} cy={0} rx={80} ry={22} fill="url(#cf-envelope)" />
          <path d="M-42 -19V19M-12 -22V22M18 -21V21M48 -17V17" stroke="#000" strokeOpacity={0.25} />
          <path d="M-72 -8Q-10 -27 74 -6" fill="none" stroke="#fcd34d" strokeOpacity={0.6} strokeWidth={1.2} />
          <path d="M-28 33H28L21 46H-21Z" fill="#26121a" />
          <path d="M-28 33H28" stroke="#fbbf24" strokeOpacity={0.5} />
          {[-13, -2, 9].map((x) => (
            <rect key={x} className="cf-window" x={x} y={37} width={5} height={4} rx={1} fill="#fde68a" />
          ))}
          <rect x={-44} y={35} width={14} height={8} rx={3} fill="#1e0d15" />
          <circle cx={-48} cy={39} r={12} fill="url(#cf-engine)" />
          <ellipse cx={-50} cy={39} rx={1.5} ry={9} fill="#e7d3b0" fillOpacity={0.35} />
          <circle className="cf-beacon" cx={80} cy={0} r={2} fill="#fde68a" />
        </g>
      </svg>

      <svg className="cf-layer cf-drift cf-drift--front" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="cf-cloud-front" cx={sx} cy={sy} r={1150} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e9906a" />
            <stop offset="0.3" stopColor="#a4484c" />
            <stop offset="0.7" stopColor="#4a1a33" />
            <stop offset="1" stopColor="#2a0f22" />
          </radialGradient>
          <linearGradient id="cf-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#12060e" stopOpacity="0" />
            <stop offset="1" stopColor="#12060e" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path d={scene.cloudsFront} fill="url(#cf-cloud-rim)" opacity={0.45} transform="translate(0 -3)" />
        <path d={scene.cloudsFront} fill="url(#cf-cloud-front)" />
        <rect x={-320} y={800} width={W + 640} height={H - 800 + 40} fill="url(#cf-floor)" />
      </svg>

      <div className="cf-lanterns">
        {scene.lanterns.map((l, i) => (
          <span
            key={i}
            className="cf-lantern"
            style={{
              left: `${l.left}%`,
              width: l.size,
              height: l.size * 1.35,
              animationDuration: `${l.duration}s`,
              animationDelay: `${l.delay}s`,
              "--sway": `${l.sway}px`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
