import { useMemo, type CSSProperties } from "react";
import { seededRandom as rng } from "@utils/seededRandom";

/**
 * Cyberpunk backdrop: neon skyline (2 parallax layers), flying traffic, perspective grid, CRT scanlines.
 * Styles in styles/themes/cyberpunk.css. `isStatic` = no animation (mobile).
 *
 * The skyline is generated from a fixed seed, so it is identical on every load. Windows are SVG
 * patterns (one fill per building) instead of individual rects to keep the DOM small.
 */

const TILE_W = 2000;
const TILE_H = 400;
const NEON = ["#ff2a6d", "#00f0ff", "#fcee0a", "#b967ff", "#05ffa1"];


interface Building { x: number; y: number; w: number; h: number }
interface Sign { x: number; y: number; w: number; h: number; color: string; delay: number }
interface Beacon { x: number; y: number; delay: number }

function buildSkyline(seed: number, minH: number, maxH: number, minW: number, maxW: number, decorate: boolean) {
  const r = rng(seed);
  const buildings: Building[] = [];
  const signs: Sign[] = [];
  const beacons: Beacon[] = [];

  for (let x = 0; x < TILE_W; ) {
    const w = Math.min(minW + r() * (maxW - minW), TILE_W - x);
    const h = minH + Math.pow(r(), 1.6) * (maxH - minH); // mostly mid-rise, a few towers
    const y = TILE_H - h;
    buildings.push({ x, y, w, h });

    if (decorate && h > 90 && r() < 0.35) {
      const vertical = r() < 0.65;
      const sw = vertical ? 6 + r() * 4 : Math.min(w - 10, 26 + r() * 30);
      const sh = vertical ? 36 + r() * 60 : 7 + r() * 4;
      signs.push({
        x: x + (vertical ? (r() < 0.5 ? 3 : w - sw - 3) : (w - sw) / 2),
        y: y + 14 + r() * Math.max(10, h * 0.35),
        w: sw,
        h: sh,
        color: NEON[Math.floor(r() * NEON.length)],
        delay: r() * 8,
      });
    }
    if (decorate && h > maxH * 0.62 && r() < 0.6) {
      beacons.push({ x: x + w / 2, y: y - 18 - r() * 16, delay: r() * 2 });
    }
    x += w + (r() < 0.3 ? r() * 8 : 0);
  }
  return { buildings, signs, beacons };
}

/** Window grid with a random set of lit windows; tiled across each building. */
function WindowPattern({ id, seed, litChance, opacity }: { id: string; seed: number; litChance: number; opacity: number }) {
  const windows = useMemo(() => {
    const r = rng(seed);
    const out: { x: number; y: number; fill: string }[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (r() > litChance) continue;
        const roll = r();
        out.push({ x: col * 12 + 4, y: row * 16 + 5, fill: roll < 0.7 ? "#ffd86b" : roll < 0.9 ? "#00f0ff" : "#ff2a6d" });
      }
    }
    return out;
  }, [seed, litChance]);

  return (
    <pattern id={id} width={96} height={128} patternUnits="userSpaceOnUse">
      {windows.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width={4} height={6} fill={w.fill} opacity={opacity} />
      ))}
    </pattern>
  );
}

interface SkylineProps {
  className: string;
  seed: number;
  fill: string;
  windows: string;
  minH: number;
  maxH: number;
  minW: number;
  maxW: number;
  decorate?: boolean;
}

function Skyline({ className, seed, fill, windows, minH, maxH, minW, maxW, decorate = false }: SkylineProps) {
  const { buildings, signs, beacons } = useMemo(
    () => buildSkyline(seed, minH, maxH, minW, maxW, decorate),
    [seed, minH, maxH, minW, maxW, decorate]
  );

  // 3 identical tiles side by side; the strip scrolls by one tile for a seamless loop.
  return (
    <div className={`cp-skyline ${className}`}>
      {[0, 1, 2].map((tile) => (
        <svg key={tile} viewBox={`0 0 ${TILE_W} ${TILE_H}`} className="cp-skyline__tile" aria-hidden>
          {buildings.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={fill} />
              {b.w > 14 && (
                <rect x={b.x + 3} y={b.y + 8} width={b.w - 6} height={b.h - 8} fill={`url(#${windows})`} />
              )}
            </g>
          ))}
          {signs.map((s, i) => (
            <rect
              key={`s${i}`}
              className="cp-neon"
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              rx={1.5}
              fill={s.color}
              style={{ "--c": s.color, animationDelay: `${s.delay}s` } as CSSProperties}
            />
          ))}
          {beacons.map((b, i) => (
            <g key={`b${i}`}>
              <line x1={b.x} y1={b.y} x2={b.x} y2={b.y + 18} stroke={fill} strokeWidth={2} />
              <circle className="cp-beacon" cx={b.x} cy={b.y} r={2.5} style={{ animationDelay: `${b.delay}s` }} />
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}

const TRAFFIC = [
  { top: "18%", duration: 14, delay: 0, color: "#00f0ff", rtl: false },
  { top: "27%", duration: 9, delay: 4, color: "#ff2a6d", rtl: true },
  { top: "34%", duration: 18, delay: 2, color: "#fcee0a", rtl: false },
  { top: "41%", duration: 11, delay: 7, color: "#00f0ff", rtl: true },
  { top: "23%", duration: 22, delay: 11, color: "#b967ff", rtl: false },
];

export function CyberpunkBackdrop({ isStatic = false }: { isStatic?: boolean }) {
  return (
    <div className={`cp-overlay ${isStatic ? "cp-overlay--static" : ""}`}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <WindowPattern id="cp-win-far" seed={7} litChance={0.22} opacity={0.35} />
          <WindowPattern id="cp-win-near" seed={42} litChance={0.3} opacity={0.85} />
        </defs>
      </svg>

      <div className="cp-sky" />

      <div className="cp-city">
        <Skyline className="cp-skyline--far" seed={1337} fill="#1b0f38" windows="cp-win-far" minH={120} maxH={330} minW={40} maxW={110} />
        <Skyline className="cp-skyline--near" seed={2077} fill="#06040d" windows="cp-win-near" minH={60} maxH={300} minW={55} maxW={150} decorate />
      </div>

      {!isStatic && (
        <div className="cp-traffic">
          {TRAFFIC.map((car, i) => (
            <span
              key={i}
              className={`cp-car ${car.rtl ? "cp-car--rtl" : ""}`}
              style={{ top: car.top, "--c": car.color, animationDuration: `${car.duration}s`, animationDelay: `${car.delay}s` } as CSSProperties}
            />
          ))}
        </div>
      )}

      <div className="cp-grid" />
      <div className="cp-scanlines" />
    </div>
  );
}
