import { useMemo, type CSSProperties } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Cyber-Fantasy (the default "sunset" theme): golden-hour sky, a setting sun with turning rays and
 * heat shimmer, floating sky islands bobbing above a glowing cloud sea, a drifting airship and
 * rising sky lanterns. Styles in styles/themes/cyber-fantasy.css. Seeded = identical every load.
 */

const W = 1600;
const H = 900;
type Pt = [number, number];
const pts = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

const SUN: Pt = [1180, 620];

/** Thin triangle from the sun centre outwards: `spread` degrees wide at the far end. */
function ray(angleDeg: number, len: number, spread = 3): string {
  const at = (deg: number): Pt => [SUN[0] + Math.cos((deg * Math.PI) / 180) * len, SUN[1] + Math.sin((deg * Math.PI) / 180) * len];
  return pts([SUN, at(angleDeg - spread / 2), at(angleDeg + spread / 2)]);
}

/** Island in local coordinates: bumpy grassy top at y≈0, jagged rock underside tapering to a tip. */
function buildIsland(r: () => number, w: number, depth: number) {
  const top: Pt[] = [];
  for (let x = 0; x <= w; x += w / 10) top.push([x, -2 - r() * 6]);

  const under: Pt[] = [[w, 4]];
  const steps = 6;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    under.push([w - t * w * 0.5 + (r() - 0.5) * 10, 4 + t * depth * 0.9 + (r() - 0.5) * 8]);
  }
  under.push([w * (0.45 + r() * 0.1), depth]);
  for (let i = steps - 1; i > 0; i--) {
    const t = i / steps;
    under.push([t * w * 0.5 + (r() - 0.5) * 10, 4 + t * depth * 0.9 + (r() - 0.5) * 8]);
  }
  under.push([0, 4]);

  // grass cap = top edge + a slightly lower copy, closed
  const cap = [...top, ...top.slice().reverse().map(([x, y]): Pt => [x, y + 7 + r() * 3])];
  const trees = Array.from({ length: 1 + Math.floor(r() * 4) }, () => ({ x: w * (0.1 + r() * 0.8), h: 10 + r() * 16 }));
  const waterfall = r() < 0.5 ? { x: w * (0.3 + r() * 0.4), len: depth * (1.2 + r()) } : null;

  return { body: pts([...top, ...under]), cap: pts(cap), trees, waterfall };
}

const ISLANDS = [
  { x: 120, y: 330, w: 260, depth: 150, scale: 0.7, layer: "far", bob: 9 },
  { x: 1300, y: 260, w: 220, depth: 120, scale: 0.6, layer: "far", bob: 11 },
  { x: 520, y: 470, w: 380, depth: 210, scale: 1, layer: "near", bob: 7 },
  { x: 1050, y: 520, w: 300, depth: 170, scale: 0.85, layer: "near", bob: 8 },
];

export function CyberFantasyBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(1717);
    const islands = ISLANDS.map((cfg, i) => ({ ...cfg, i, shape: buildIsland(r, cfg.w, cfg.depth) }));
    const rays = Array.from({ length: 18 }, (_, i) => ({ angle: (360 / 18) * i + r() * 6, len: 380 + r() * 260 }));
    const clouds = Array.from({ length: 16 }, () => ({ x: r() * W, y: 790 + r() * 90, rx: 140 + r() * 180, ry: 30 + r() * 30 }));
    const lanterns = Array.from({ length: 12 }, () => ({
      left: 4 + r() * 92,
      size: 7 + r() * 6,
      duration: 22 + r() * 16,
      delay: -r() * 38,
      sway: (r() - 0.5) * 80,
    }));
    return { islands, rays, clouds, lanterns };
  }, []);

  return (
    <div className={`theme-scene cf-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="cf-sky" />

      <svg className="cf-world" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="cf-sun">
            <stop offset="0" stopColor="#fff7d6" />
            <stop offset="0.35" stopColor="#fcd34d" />
            <stop offset="0.7" stopColor="#f97316" stopOpacity="0.85" />
            <stop offset="1" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cf-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a2f22" />
            <stop offset="1" stopColor="#140b08" />
          </linearGradient>
          <linearGradient id="cf-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6ee7b7" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="cf-falls" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.8" />
            <stop offset="1" stopColor="#e0f2fe" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cf-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fcd9a8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7c2d12" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="cf-envelope" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7c4a2a" />
            <stop offset="1" stopColor="#2a160d" />
          </linearGradient>
        </defs>

        {/* sun + slowly turning rays */}
        <g className="cf-rays">
          {scene.rays.map((r, i) => (
            <polygon key={i} points={ray(r.angle, r.len)} />
          ))}
        </g>
        <circle className="cf-sun" cx={SUN[0]} cy={SUN[1]} r={150} fill="url(#cf-sun)" />

        {scene.islands.map((isl) => (
          <g key={isl.i} className={`cf-island cf-island--${isl.layer}`} style={{ "--bob": `${isl.bob}s` } as CSSProperties}>
            <g transform={`translate(${isl.x} ${isl.y}) scale(${isl.scale})`}>
              {isl.shape.waterfall && (
                <rect
                  className="cf-falls"
                  x={isl.shape.waterfall.x}
                  y={4}
                  width={6}
                  height={isl.shape.waterfall.len}
                  fill="url(#cf-falls)"
                />
              )}
              <polygon points={isl.shape.body} fill="url(#cf-rock)" />
              <polygon points={isl.shape.cap} fill="url(#cf-grass)" />
              {isl.shape.trees.map((t, k) => (
                <g key={k}>
                  <rect x={t.x - 1.5} y={-t.h * 0.4} width={3} height={t.h * 0.45} fill="#2a160d" />
                  <circle cx={t.x} cy={-t.h * 0.55} r={t.h * 0.35} fill="#059669" />
                </g>
              ))}
              {/* sun-side rim light */}
              <polyline points={isl.shape.body} fill="none" stroke="#fbbf24" strokeOpacity={0.35} strokeWidth={1.2} />
            </g>
          </g>
        ))}

        {/* airship: envelope, ribs, gondola, lamp; drifts across and bobs */}
        <g className="cf-airship">
          <g className="cf-airship__bob">
            <ellipse cx={0} cy={0} rx={70} ry={24} fill="url(#cf-envelope)" stroke="#fbbf24" strokeOpacity={0.5} />
            <path d="M-50 -16Q0 -30 50 -16M-62 0H62M-50 16Q0 30 50 16" fill="none" stroke="#fbbf24" strokeOpacity={0.35} />
            <path d="M-30 22L-18 40M30 22L18 40" stroke="#c08457" strokeWidth={1} />
            <rect x={-22} y={38} width={44} height={11} rx={3} fill="#3b2416" />
            <circle className="cf-lamp" cx={0} cy={44} r={3} fill="#fde68a" />
            <rect x={-82} y={-5} width={10} height={10} rx={2} fill="#3b2416" />
          </g>
        </g>

        <g className="cf-clouds">
          {scene.clouds.map((c, i) => (
            <ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill="url(#cf-cloud)" />
          ))}
        </g>
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
