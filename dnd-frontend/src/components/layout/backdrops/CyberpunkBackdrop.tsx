import { useMemo, type CSSProperties } from "react";
import { seededRandom as rng } from "@utils/seededRandom";

/**
 * Cyberpunk backdrop: the city seen through an apartment window. A megatower on the skyline, three
 * parallax layers of stepped towers with neon and beacons, sweeping searchlights, drifting smog,
 * flying traffic and an elevated highway of tail lights. Bottom right, the glass is cracked and the
 * crack bleeds red: a Blackwall breach (corruption flowing out along the cracks, glitch blocks, a
 * warning HUD, the odd red glitch tearing across the screen). Holo ads blip on the facades, and a
 * projector beams a spinning hologram up out of the streets.
 * Styles in styles/themes/cyberpunk.css. `isStatic` = no animation (mobile).
 *
 * Everything comes from fixed seeds, so it is identical on every load. Windows are SVG patterns (one
 * fill per building) instead of individual rects to keep the DOM small.
 */

const TILE_W = 2000;
const TILE_H = 400;
const NEON = ["#ff2a6d", "#00f0ff", "#fcee0a", "#b967ff", "#05ffa1"];

interface Box { x: number; y: number; w: number; h: number }
interface Building { body: Box; top: Box | null; spire: Box | null; roof: Box | null }
interface Sign extends Box { color: string; delay: number }
interface Beacon { x: number; y: number; delay: number }
interface Ad extends Box { text: string; color: string; dur: number; delay: number }

/** Holo ad screens on facades: dark most of the time, they blip on for a moment. */
const AD_TEXT = ["NOODLES 24/7", "ラーメン", "CHROME CLINIC", "NEURAL LINK -40%", "酒", "SYNTH·SKIN", "STAY ONLINE", "BRAINDANCE"];

const rect = (b: Box) => `M${b.x.toFixed(1)} ${b.y.toFixed(1)}h${b.w.toFixed(1)}v${b.h.toFixed(1)}h${(-b.w).toFixed(1)}Z`;

function buildSkyline(seed: number, minH: number, maxH: number, minW: number, maxW: number, decorate: boolean, withAds: boolean) {
  const r = rng(seed);
  const ra = rng(seed + 1);
  const buildings: Building[] = [];
  const signs: Sign[] = [];
  const beacons: Beacon[] = [];
  const ads: Ad[] = [];

  for (let x = 0; x < TILE_W; ) {
    const w = Math.min(minW + r() * (maxW - minW), TILE_W - x);
    const h = minH + Math.pow(r(), 1.6) * (maxH - minH); // mostly mid-rise, a few towers
    const body = { x, y: TILE_H - h, w, h };
    // tall ones step back into a narrower crown, some carry a mast
    const top = h > maxH * 0.45 && w > 40 && r() < 0.6 ? { w: w * (0.5 + r() * 0.25), h: 20 + r() * h * 0.3 } : null;
    const topBox = top && { x: x + (w - top.w) / 2, y: body.y - top.h, w: top.w, h: top.h };
    const peakY = topBox ? topBox.y : body.y;
    const spire = h > maxH * 0.55 && r() < 0.45 ? { x: x + w / 2 - 1, y: peakY - 20 - r() * 40, w: 2, h: 0 } : null;
    if (spire) spire.h = peakY - spire.y;
    const roof = !topBox && r() < 0.5 ? { x: x + 4 + r() * (w - 20), y: body.y - 5 - r() * 5, w: 8 + r() * 8, h: 0 } : null;
    if (roof) roof.h = body.y - roof.y;
    buildings.push({ body, top: topBox, spire, roof });

    if (decorate && h > 90 && r() < 0.4) {
      const vertical = r() < 0.65;
      const sw = vertical ? 6 + r() * 4 : Math.min(w - 10, 26 + r() * 30);
      const sh = vertical ? 36 + r() * 60 : 7 + r() * 4;
      signs.push({
        x: x + (vertical ? (r() < 0.5 ? 3 : w - sw - 3) : (w - sw) / 2),
        y: body.y + 14 + r() * Math.max(10, h * 0.35),
        w: sw,
        h: sh,
        color: NEON[Math.floor(r() * NEON.length)],
        delay: r() * 8,
      });
    }
    if (decorate && (spire || h > maxH * 0.62) && r() < 0.7) {
      beacons.push({ x: x + w / 2, y: spire ? spire.y : peakY - 4, delay: r() * 2 });
    }
    if (withAds && w > 60 && h > 130 && ra() < 0.5) {
      const fits = AD_TEXT.filter((t) => t.length * 6 + 12 <= w - 10);
      if (fits.length) {
        const text = fits[Math.floor(ra() * fits.length)];
        const aw = text.length * 6 + 12;
        ads.push({
          x: x + (w - aw) / 2,
          y: body.y + 18 + ra() * h * 0.3,
          w: aw,
          h: 16,
          text,
          color: NEON[Math.floor(ra() * NEON.length)],
          dur: 7 + ra() * 7,
          delay: ra() * 8,
        });
      }
    }
    x += w + (r() < 0.3 ? r() * 8 : 0);
  }
  return { buildings, signs, beacons, ads };
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
  withAds?: boolean;
}

function Skyline({ className, seed, fill, windows, minH, maxH, minW, maxW, decorate = false, withAds = false }: SkylineProps) {
  const { buildings, signs, beacons, ads } = useMemo(
    () => buildSkyline(seed, minH, maxH, minW, maxW, decorate, withAds),
    [seed, minH, maxH, minW, maxW, decorate, withAds]
  );
  const silhouette = buildings.map((b) => [b.body, b.top, b.spire, b.roof].filter((p): p is Box => !!p).map(rect).join("")).join("");
  const lit = buildings.flatMap((b) => [b.body, b.top].filter((p): p is Box => !!p && p.w > 14)).map((p) => rect({ x: p.x + 3, y: p.y + 6, w: p.w - 6, h: p.h - 6 })).join("");

  // 3 identical tiles side by side; the strip scrolls by one tile for a seamless loop.
  return (
    <div className={`cp-skyline ${className}`}>
      {[0, 1, 2].map((tile) => (
        <svg key={tile} viewBox={`0 0 ${TILE_W} ${TILE_H}`} className="cp-skyline__tile" aria-hidden>
          <path d={silhouette} fill={fill} />
          <path d={lit} fill={`url(#${windows})`} />
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
          {ads.map((ad, i) => (
            <g key={`a${i}`} className="cp-ad" style={{ "--c": ad.color, animationDuration: `${ad.dur}s`, animationDelay: `${ad.delay}s` } as CSSProperties}>
              <rect x={ad.x} y={ad.y} width={ad.w} height={ad.h} fill="#0a0414" fillOpacity={0.85} stroke={ad.color} strokeWidth={1} />
              <text x={ad.x + ad.w / 2} y={ad.y + 11.5} textAnchor="middle" fontSize={10} letterSpacing={0.5} fill={ad.color} fontFamily="Share Tech Mono, monospace">
                {ad.text}
              </text>
            </g>
          ))}
          {beacons.map((b, i) => (
            <circle key={`b${i}`} className="cp-beacon" cx={b.x} cy={b.y} r={2.5} style={{ animationDelay: `${b.delay}s` }} />
          ))}
        </svg>
      ))}
    </div>
  );
}

/** The megatower: one landmark far off, too big to scroll with the rest. viewBox 200×800. */
function Megatower() {
  return (
    <svg className="cp-landmark" viewBox="0 0 200 800" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <defs>
        <linearGradient id="cp-holo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff2a6d" stopOpacity="0.55" />
          <stop offset="1" stopColor="#00f0ff" stopOpacity="0.35" />
        </linearGradient>
        <pattern id="cp-holo-lines" width={4} height={4} patternUnits="userSpaceOnUse">
          <rect width={4} height={1.4} fill="#ffffff" opacity={0.25} />
        </pattern>
      </defs>
      {/* shaft tapering into a split crown, mast on top */}
      <path d="M30 800L52 170L70 120H90V40H96V0H104V40H110V120H130L148 170L170 800Z" fill="#1f0f42" />
      <path d="M70 120L88 150V800H84L66 160ZM130 120L112 150V800H116L134 160Z" fill="#2c1659" />
      {/* light strips running up the shaft, floors banded faintly */}
      <path d="M99 160V800M60 300L50 800M140 300L150 800" stroke="#00f0ff" strokeWidth={1.2} opacity={0.45} />
      <path d="M44 400H156M40 520H160M36 640H164" stroke="#b967ff" strokeWidth={0.8} opacity={0.3} />
      {/* holographic billboard hanging off the shaft */}
      <g className="cp-holo">
        <rect x={56} y={250} width={88} height={110} fill="url(#cp-holo)" />
        <rect x={56} y={250} width={88} height={110} fill="url(#cp-holo-lines)" />
        <path d="M100 272L124 316L100 340L76 316Z" fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.7} />
      </g>
      <circle className="cp-beacon" cx={100} cy={2} r={3} />
      <circle className="cp-beacon" cx={70} cy={120} r={2.5} style={{ animationDelay: "0.7s" }} />
      <circle className="cp-beacon" cx={130} cy={120} r={2.5} style={{ animationDelay: "1.4s" }} />
    </svg>
  );
}

const TRAFFIC = [
  { top: "16%", duration: 14, delay: 0, color: "#00f0ff", rtl: false, size: 1 },
  { top: "24%", duration: 9, delay: 4, color: "#ff2a6d", rtl: true, size: 1.2 },
  { top: "31%", duration: 18, delay: 2, color: "#fcee0a", rtl: false, size: 0.8 },
  { top: "38%", duration: 11, delay: 7, color: "#00f0ff", rtl: true, size: 1 },
  { top: "21%", duration: 26, delay: 11, color: "#b967ff", rtl: false, size: 0.5 },
  { top: "45%", duration: 7, delay: 3, color: "#ff2a6d", rtl: false, size: 1.5 },
  { top: "12%", duration: 30, delay: 15, color: "#05ffa1", rtl: true, size: 0.5 },
];

/* ---------- The Blackwall breach: a crack in the glass, bottom right ---------- */

/** Impact point, px from the bottom-right corner (the breach SVG's viewBox origin is that corner). */
const IMPACT = { x: -230, y: -190 };
const BREACH_W = 760;
const BREACH_H = 560;
/** Ring radii of the spiderweb; the glass between two rays and two rings is one shard. */
const RINGS = [26, 60, 112, 180, 260];
const MOSH = ["#ff003c", "#7a0019", "#ffd0d8", "#00f0ff", "#1a0008", "#ff003c"];

type Pt = [number, number];

function buildCrack() {
  const r = rng(0xb1ac);
  const N = 14;
  const rays: Pt[][] = [];
  for (let i = 0; i < N; i++) {
    const a = ((i / N) * 360 + (r() - 0.5) * 18) * (Math.PI / 180);
    const len = 120 + r() * 360;
    const pts: Pt[] = [[IMPACT.x, IMPACT.y]];
    for (let d = 0; d < len; ) {
      const step = 14 + r() * 28;
      const ang = a + (r() - 0.5) * 0.35;
      const [px, py] = pts[pts.length - 1];
      pts.push([px + Math.cos(ang) * step, py + Math.sin(ang) * step]);
      d += step;
    }
    rays.push(pts);
  }

  const line = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const dist = ([x, y]: Pt) => Math.hypot(x - IMPACT.x, y - IMPACT.y);
  // index of each ray's vertex nearest each ring (null once the ray has ended)
  const at = rays.map((ray) =>
    RINGS.map((rr) => {
      if (dist(ray[ray.length - 1]) < rr) return null;
      let best = 0;
      ray.forEach((p, j) => {
        if (Math.abs(dist(p) - rr) < Math.abs(dist(ray[best]) - rr)) best = j;
      });
      return best;
    })
  );

  let d = rays.map(line).join("");

  // spiderweb rings: join neighbouring rays at those vertices, with a small kink
  const kinks: (Pt | null)[][] = RINGS.map(() => Array(N).fill(null));
  RINGS.forEach((_, k) => {
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      const ai = at[i][k];
      const aj = at[j][k];
      if (ai === null || aj === null || r() > [1, 0.95, 0.8, 0.6, 0.4][k]) continue;
      const p = rays[i][ai];
      const q = rays[j][aj];
      const m: Pt = [(p[0] + q[0]) / 2 + (r() - 0.5) * 8, (p[1] + q[1]) / 2 + (r() - 0.5) * 8];
      kinks[k][i] = m;
      d += line([p, m, q]);
    }
  });

  // shards: the cells between rays i, i+1 and two rings, each facet catching the light differently
  const shards: { d: string; fill: string; opacity: number }[] = [];
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    for (let k = -1; k < RINGS.length - 1; k++) {
      const ai0 = k < 0 ? 0 : at[i][k];
      const aj0 = k < 0 ? 0 : at[j][k];
      const ai1 = at[i][k + 1];
      const aj1 = at[j][k + 1];
      if (ai0 === null || aj0 === null || ai1 === null || aj1 === null) continue;
      const pts: Pt[] = [...rays[i].slice(ai0, ai1 + 1)];
      const m = kinks[k + 1][i];
      if (m) pts.push(m);
      pts.push(...rays[j].slice(aj0, aj1 + 1).reverse());
      const tone = r();
      shards.push({
        d: line(pts) + "Z",
        fill: tone < 0.15 ? "#000000" : tone < 0.45 ? "#bff6ff" : "#ffffff",
        opacity: tone < 0.15 ? 0.22 : 0.02 + r() * 0.08,
      });
    }
  }
  const shardsD = shards.map((s) => s.d).join("");

  // side splinters off the rays
  rays.forEach((ray) => {
    for (let b = 0; b < 2; b++) {
      if (ray.length < 4 || r() < 0.3) continue;
      const [sx, sy] = ray[2 + Math.floor(r() * (ray.length - 3))];
      const a = Math.atan2(sy - IMPACT.y, sx - IMPACT.x) + (r() < 0.5 ? -1 : 1) * (0.45 + r() * 0.4);
      const pts: Pt[] = [[sx, sy]];
      for (let s = 0, n = 2 + Math.floor(r() * 3); s < n; s++) {
        const [px, py] = pts[pts.length - 1];
        const step = 12 + r() * 26;
        const ang = a + (r() - 0.5) * 0.5;
        pts.push([px + Math.cos(ang) * step, py + Math.sin(ang) * step]);
      }
      d += line(pts);
    }
  });

  // crushed core: a ring of tiny chips round the impact
  let core = "";
  for (let s = 0; s < 18; s++) {
    const a = (s / 18) * Math.PI * 2 + r() * 0.2;
    const r0 = 4 + r() * 4;
    const r1 = 9 + r() * 9;
    core += line([[IMPACT.x + Math.cos(a) * r0, IMPACT.y + Math.sin(a) * r0], [IMPACT.x + Math.cos(a) * r1, IMPACT.y + Math.sin(a) * r1]]);
  }

  // the longest rays carry the corruption outward
  const tendrils = [...rays].sort((p, q) => q.length - p.length).slice(0, 6).map(line);

  // glints sit where a ring meets a ray
  const sparkles = [1, 2, 3, 1, 2].map((k, s) => {
    const i = (s * 5 + 2) % N;
    const idx = at[i][k] ?? 1;
    const [x, y] = rays[i][Math.min(idx, rays[i].length - 1)];
    return { x, y, size: 10 + r() * 10, dur: 4 + r() * 3, delay: -r() * 6 };
  });

  // most glitch blocks fire together in a burst; a few flicker on their own as background noise
  const blocks = Array.from({ length: 18 }, () => {
    const roll = r();
    return {
      x: Math.min(-8, IMPACT.x + (r() - 0.5) * 440),
      y: Math.min(-8, IMPACT.y + (r() - 0.5) * 320),
      w: 6 + r() * 80,
      h: 2 + r() * 10,
      color: roll < 0.65 ? "#ff003c" : roll < 0.8 ? "#ff8095" : "#00f0ff",
      burst: r() < 0.7,
      dur: 3 + r() * 5,
      delay: r() * 0.3,
      static: r() < 0.4,
    };
  });

  // datamosh patches: blocky corrupted pixels
  const mosh = [
    { x: IMPACT.x - 150, y: IMPACT.y - 90 },
    { x: IMPACT.x + 40, y: IMPACT.y + 50 },
    { x: IMPACT.x - 40, y: IMPACT.y - 210 },
  ].map((p) => ({
    ...p,
    cells: Array.from({ length: 22 * 10 }, (_, c) => ({ x: (c % 22) * 6, y: Math.floor(c / 22) * 6, on: r() < 0.32, color: MOSH[Math.floor(r() * MOSH.length)] })).filter((c) => c.on),
  }));

  return { d, shards, shardsD, core, tendrils, sparkles, blocks, mosh };
}

function Breach() {
  const { d, shards, shardsD, core, tendrils, sparkles, blocks, mosh } = useMemo(buildCrack, []);
  const vb = `${-BREACH_W} ${-BREACH_H} ${BREACH_W} ${BREACH_H}`;
  return (
    <div className="cp-breach" style={{ width: BREACH_W, height: BREACH_H, "--ix": `${BREACH_W + IMPACT.x}px`, "--iy": `${BREACH_H + IMPACT.y}px` } as CSSProperties}>
      <div className="cp-breach__bleed" />

      {/* red light leaking through the fractures; pulses as a whole layer (composited) */}
      <svg className="cp-breach__glow" viewBox={vb} aria-hidden>
        <defs>
          <filter id="cp-crack-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
        <path d={d} fill="none" stroke="#ff1744" strokeWidth={3} strokeOpacity={0.6} filter="url(#cp-crack-blur)" />
        <circle cx={IMPACT.x} cy={IMPACT.y} r={34} fill="#ff1744" opacity={0.35} filter="url(#cp-crack-blur)" />
      </svg>

      {/* the broken pane: tilted facets, a cold specular sheen, then the fracture lines on top */}
      <svg className="cp-breach__crack cp-breach__pane" viewBox={vb} aria-hidden>
        <defs>
          <clipPath id="cp-shards">
            <path d={shardsD} />
          </clipPath>
          <linearGradient id="cp-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0.3" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.48" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="0.52" stopColor="#e8fbff" stopOpacity="0.08" />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {shards.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} opacity={s.opacity} />
        ))}
        <rect x={IMPACT.x - 280} y={IMPACT.y - 260} width={560} height={520} fill="url(#cp-sheen)" clipPath="url(#cp-shards)" />
        <g fill="none" strokeLinejoin="round" strokeLinecap="round">
          <path d={d} stroke="#000" strokeWidth={2.6} opacity={0.55} />
          <path d={d} stroke="#ff003c" strokeWidth={1} opacity={0.65} transform="translate(-1.3 0)" />
          <path d={d} stroke="#00f0ff" strokeWidth={1} opacity={0.3} transform="translate(1.3 0)" />
          <path d={d} stroke="#ffe3e8" strokeWidth={0.9} opacity={0.8} />
          {/* lit upper edge of each fracture: glass catching the light */}
          <path d={d} stroke="#ffffff" strokeWidth={0.5} opacity={0.55} transform="translate(-0.6 -0.8)" />
          <path d={core} stroke="#ffffff" strokeWidth={0.8} opacity={0.8} />
        </g>
        <circle cx={IMPACT.x} cy={IMPACT.y} r={7} fill="#ffeef1" opacity={0.35} />
        <circle cx={IMPACT.x} cy={IMPACT.y} r={2.5} fill="#fff" />
      </svg>

      {/* corruption crawling out along the longest fractures (repaints, so kept in its own small layer) */}
      <svg className="cp-breach__crack" viewBox={vb} aria-hidden>
        {tendrils.map((t, i) => (
          <path key={i} className="cp-tendril" d={t} style={{ animationDelay: `${-i * 0.37}s` }} />
        ))}
      </svg>

      {/* glitch burst: chromatic ghosts of the crack jumping sideways */}
      <svg className="cp-breach__crack cp-ghost cp-ghost--r" viewBox={vb} aria-hidden>
        <path d={d} fill="none" stroke="#ff003c" strokeWidth={1.6} />
      </svg>
      <svg className="cp-breach__crack cp-ghost cp-ghost--c" viewBox={vb} aria-hidden>
        <path d={d} fill="none" stroke="#00f0ff" strokeWidth={1.2} />
      </svg>

      {mosh.map((m, i) => (
        <svg key={i} className="cp-mosh" width={132} height={60} style={{ right: -m.x - 66, bottom: -m.y - 30, animationDelay: `${i * 0.08}s` }} aria-hidden>
          {m.cells.map((c, k) => (
            <rect key={k} x={c.x} y={c.y} width={6} height={6} fill={c.color} />
          ))}
        </svg>
      ))}

      {blocks.map((b, i) => (
        <span
          key={i}
          className={`cp-glitch-block ${b.burst ? "cp-glitch-block--burst" : ""} ${b.static ? "cp-glitch-block--static" : ""}`}
          style={{
            right: -b.x,
            bottom: -b.y,
            width: b.w,
            height: b.h,
            "--c": b.color,
            animationDuration: b.burst ? undefined : `${b.dur}s`,
            animationDelay: `${b.burst ? b.delay : -b.dur * b.delay * 3}s`,
          } as CSSProperties}
        />
      ))}

      {sparkles.map((s, i) => (
        <span
          key={i}
          className="cp-sparkle"
          style={{ right: -s.x - s.size / 2, bottom: -s.y - s.size / 2, width: s.size, height: s.size, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        />
      ))}

      <div className="cp-breach__hud" role="presentation">
        <div className="cp-breach__title">⚠ BLACKWALL BREACH</div>
        <div>ERR//0xB1ACC :: ICE INTEGRITY 03%</div>
        <div>TRACE ROUTE LOST · SOURCE UNKNOWN</div>
        <div className="cp-breach__whisper">something is on the other side</div>
      </div>
    </div>
  );
}

export function CyberpunkBackdrop({ isStatic = false }: { isStatic?: boolean }) {
  return (
    <div className={`cp-overlay ${isStatic ? "cp-overlay--static" : ""}`}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <WindowPattern id="cp-win-haze" seed={3} litChance={0.15} opacity={0.22} />
          <WindowPattern id="cp-win-far" seed={7} litChance={0.22} opacity={0.4} />
          <WindowPattern id="cp-win-near" seed={42} litChance={0.3} opacity={0.85} />
        </defs>
      </svg>

      <div className="cp-sky" />
      <Megatower />

      <div className="cp-beams">
        {[22, 71].map((left, i) => (
          <span key={i} className="cp-beam" style={{ left: `${left}%`, animationDelay: `${-i * 7}s` }} />
        ))}
      </div>

      <div className="cp-smog cp-smog--back" />

      <div className="cp-city">
        <Skyline className="cp-skyline--haze" seed={404} fill="#26134d" windows="cp-win-haze" minH={160} maxH={380} minW={30} maxW={80} />
        <Skyline className="cp-skyline--far" seed={1337} fill="#150a30" windows="cp-win-far" minH={120} maxH={340} minW={40} maxW={110} decorate />
        <div className="cp-holobeam">
          <span className="cp-holobeam__cone" />
          <span className="cp-holobeam__emblem">
            <svg viewBox="-60 -70 120 140" aria-hidden>
              <g fill="none" stroke="#7ff8ff" strokeWidth={1.6} strokeLinejoin="round">
                <path d="M0 -64L44 0L0 64L-44 0Z" />
                <path d="M0 -64L15 0L0 64L-15 0Z" opacity={0.7} />
                <ellipse cx={0} cy={0} rx={44} ry={10} opacity={0.55} />
                <path d="M0 -64V64" opacity={0.35} />
              </g>
            </svg>
          </span>
        </div>
        <Skyline className="cp-skyline--near" seed={2077} fill="#06040d" windows="cp-win-near" minH={60} maxH={300} minW={55} maxW={150} decorate withAds />
      </div>

      <div className="cp-smog cp-smog--front" />


      <div className="cp-traffic">
        {TRAFFIC.map((car, i) => (
          <span
            key={i}
            className={`cp-car ${car.rtl ? "cp-car--rtl" : ""}`}
            style={{ top: car.top, "--c": car.color, width: 70 * car.size, "--o": Math.min(0.95, 0.35 + car.size * 0.4), animationDuration: `${car.duration}s`, animationDelay: `${car.delay}s` } as CSSProperties}
          />
        ))}
      </div>

      {/* elevated highway: tail lights one way, headlights the other, neon smeared on the wet deck */}
      <div className="cp-street">
        <span className="cp-lane cp-lane--tail" />
        <span className="cp-lane cp-lane--head" />
      </div>

      <div className="cp-glass" />
      <div className="cp-scanlines" />
      {[18, 47, 71].map((top, i) => (
        <span key={i} className="cp-tear" style={{ top: `${top}%`, animationDelay: `${-i * 3.1}s` }} />
      ))}
      <Breach />
    </div>
  );
}
