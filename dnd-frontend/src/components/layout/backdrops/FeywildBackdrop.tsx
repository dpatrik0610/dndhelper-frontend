import { useMemo, type CSSProperties } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Feywild Bloom: an enchanted twilight forest. Depth comes from three layers of procedurally grown,
 * branching trees (far = small and blurred in violet haze, mid = leafy and softly out of focus, near =
 * two old rim-lit trees leaning in to frame the glade, crowns in blossom with wisteria drapes),
 * bioluminescent mushrooms lit from within, gradient grass with blurred foreground blades (depth of field), soft light shafts, wandering fireflies and out-of-focus bokeh.
 * (Spinning petals = the shared particles.) Styles in styles/themes/feywild.css. Seeded = identical every load.
 */

const W = 1600;
const H = 900;
const f = (n: number) => n.toFixed(1);
const GLOWS = ["#f472b6", "#5eead4", "#c084fc", "#fbbf24"];
/** Mid-crown leaf tints: deep teal, dusk blue, plum, with the odd moonlit sage */
const LEAVES = ["#10291f", "#16203a", "#251433", "#10291f", "#2a4538"];
/** Blossom tints: rose, blush, deep pink, lilac */
const BLOOMS = ["#f472b6", "#f9a8d4", "#db2777", "#c084fc", "#f472b6"];

const rad = (a: number) => (a * Math.PI) / 180;

interface Tip { x: number; y: number }

/**
 * A branching tree grown from (x, y): each limb is a tapered quadratic curve that bends a little and
 * forks into 2–3 shorter, thinner limbs; `trunk` limbs just continue (a gnarled bole before the
 * crown). All limbs (and a root flare) go into one path, every subpath wound the same way so overlaps
 * don't punch holes. Returns the twig tips, where the crown is drawn.
 */
function tree(r: () => number, x: number, y: number, len: number, width: number, angle: number, depth: number, trunk = 2) {
  let d = `M${f(x - width / 2)} ${f(y - width * 0.9)}Q${f(x - width * 0.55)} ${f(y - width * 0.2)} ${f(x - width * 1.5)} ${f(y)}H${f(x + width * 1.5)}Q${f(x + width * 0.55)} ${f(y - width * 0.2)} ${f(x + width / 2)} ${f(y - width * 0.9)}Z`;
  const tips: Tip[] = [];
  const limb = (x0: number, y0: number, a: number, l: number, w0: number, left: number, bole: number) => {
    const a1 = a + (r() - 0.5) * 34;
    const am = (a + a1) / 2;
    const w1 = Math.max(1.2, w0 * (bole > 0 ? 0.86 : 0.66));
    const wm = (w0 + w1) / 2;
    const cx = x0 + Math.cos(rad(a)) * l * 0.5;
    const cy = y0 + Math.sin(rad(a)) * l * 0.5;
    const x1 = cx + Math.cos(rad(a1)) * l * 0.5;
    const y1 = cy + Math.sin(rad(a1)) * l * 0.5;
    const side = (px: number, py: number, ang: number, w: number, s: number) => `${f(px - Math.sin(rad(ang)) * w * s * 0.5)} ${f(py + Math.cos(rad(ang)) * w * s * 0.5)}`;
    d += `M${side(x0, y0, a, w0, 1)}Q${side(cx, cy, am, wm, 1)} ${side(x1, y1, a1, w1, 1)}L${side(x1, y1, a1, w1, -1)}Q${side(cx, cy, am, wm, -1)} ${side(x0, y0, a, w0, -1)}Z`;
    // round knuckle so the next limb joins without a notch
    const k = w1 / 2;
    d += `M${f(x1 + k)} ${f(y1)}a${f(k)} ${f(k)} 0 1 0 ${f(-2 * k)} 0a${f(k)} ${f(k)} 0 1 0 ${f(2 * k)} 0Z`;
    if (bole > 0) return limb(x1, y1, a1 + (r() - 0.5) * 16, l * 0.9, w1, left, bole - 1);
    if (left === 0) return void tips.push({ x: x1, y: y1 });
    const n = r() < 0.3 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const fan = (i / (n - 1) - 0.5) * 70 + (r() - 0.5) * 18;
      const up = (-90 - a1) * 0.18; // a gentle pull back toward the light
      limb(x1, y1, a1 + fan + up, l * (0.66 + r() * 0.16), w1 * 0.9, left - 1, 0);
    }
  };
  limb(x, y - width * 0.6, angle, len, width, depth, trunk);
  return { d, tips };
}

/** Clumps of soft blobs around each twig tip: a crown that actually sits on its branches. */
function crown(r: () => number, tips: Tip[], size: number, per = 3) {
  return tips.flatMap((t) =>
    Array.from({ length: per }, () => ({ cx: t.x + (r() - 0.5) * size * 1.4, cy: t.y + (r() - 0.6) * size, rad: size * (0.5 + r() * 0.6), tone: r() }))
  );
}

/** Tapered grass blade from (x, H). */
function blade(r: () => number, x: number, maxH: number) {
  const h = maxH * (0.4 + r() * 0.6);
  const lean = (r() - 0.5) * 50;
  const w = 2 + r() * 3;
  return `M${f(x - w)} ${H}Q${f(x + lean * 0.25)} ${f(H - h * 0.6)} ${f(x + lean)} ${f(H - h)}Q${f(x + lean * 0.25 + w)} ${f(H - h * 0.55)} ${f(x + w)} ${H}Z`;
}

interface Shroom { x: number; y: number; h: number; c: number; color: string; lean: number; delay: number }

export function FeywildBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(5150);
    // far: small trees on the horizon, lost in violet haze
    const far = Array.from({ length: 9 }, (_, i) => tree(r, 60 + i * 185 + r() * 70, 700 + r() * 30, 46 + r() * 22, 9 + r() * 5, -90 + (r() - 0.5) * 14, 4, 1));
    const farCrown = far.flatMap((t) => crown(r, t.tips, 22, 2));
    // mid: four trees either side of the glade, softly out of focus
    const mid = [300, 620, 990, 1310].map((x) => tree(r, x + (r() - 0.5) * 50, H - 46, 80 + r() * 70, 24 + r() * 12, -90 + (r() - 0.5) * 16, 5));
    const midCrown = mid.flatMap((t) => crown(r, t.tips, 32, 4));
    // near: two old trees leaning in to frame the glade, crowns in blossom
    const near = [
      tree(r, 30, H - 30, 175, 66, -72, 6, 1),
      tree(r, 1570, H - 30, 185, 70, -108, 6, 1),
    ];
    const blossom = near.flatMap((t) => crown(r, t.tips, 14, 4));
    // wisteria drapes hanging from the near crowns' lower twigs
    const drapes = near
      .flatMap((t) => t.tips)
      .filter((t) => t.y > 60 && t.y < 520 && r() < 0.2)
      .map((t) => ({ x: t.x, y: t.y, n: 5 + Math.floor(r() * 5) }));
    const shrooms: Shroom[] = [190, 470, 780, 1040, 1270].flatMap((x) =>
      Array.from({ length: 2 + Math.floor(r() * 3) }, (_, i) => ({
        x: x + (i - 1) * (18 + r() * 14),
        y: H - 30 - r() * 10,
        h: 26 + r() * 36,
        c: 12 + r() * 14,
        color: GLOWS[Math.floor(r() * GLOWS.length)],
        lean: (r() - 0.5) * 10,
        delay: -r() * 4,
      }))
    );
    const grass = Array.from({ length: 120 }, () => blade(r, r() * W, 70));
    const foreground = Array.from({ length: 14 }, () => blade(r, r() * W, 170));
    const fireflies = Array.from({ length: 26 }, () => ({
      left: r() * 100,
      top: 30 + r() * 60,
      dx: 30 + r() * 70,
      dy: 20 + r() * 50,
      tx: 5 + r() * 6,
      ty: 4 + r() * 5,
      blink: 1.5 + r() * 2.5,
      delay: -r() * 10,
    }));
    const bokeh = Array.from({ length: 7 }, (_, i) => ({
      left: r() * 95,
      top: 15 + r() * 70,
      size: 40 + r() * 70,
      color: i % 2 ? "rgba(244, 114, 182, 0.18)" : "rgba(253, 230, 138, 0.16)",
      dur: 14 + r() * 10,
    }));
    return { far, farCrown, mid, midCrown, near, blossom, drapes, shrooms, grass, foreground, fireflies, bokeh };
  }, []);

  return (
    <div className={`theme-scene fw-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="fw-sky" />

      <svg className="fw-world" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id="fw-blur-far" x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="fw-blur-mid" x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
          <filter id="fw-blur-soft" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.3" />
          </filter>
          <filter id="fw-blur-fg" x="-50%" y="-10%" width="200%" height="120%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <linearGradient id="fw-grass" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#040a07" />
            <stop offset="1" stopColor="#1f4030" />
          </linearGradient>
          <linearGradient id="fw-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1a14" />
            <stop offset="1" stopColor="#040806" />
          </linearGradient>
          <linearGradient id="fw-stem" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6b5a6e" />
            <stop offset="0.5" stopColor="#efe4f2" />
            <stop offset="1" stopColor="#5a4a5e" />
          </linearGradient>
          {GLOWS.map((c) => (
            <radialGradient key={c} id={`fw-cap-${c.slice(1)}`} cx="0.5" cy="0.95" r="0.9">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.35" stopColor={c} stopOpacity="0.9" />
              <stop offset="1" stopColor={c} stopOpacity="0.35" />
            </radialGradient>
          ))}
          {GLOWS.map((c) => (
            <radialGradient key={`h${c}`} id={`fw-halo-${c.slice(1)}`}>
              <stop offset="0" stopColor={c} stopOpacity="0.45" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* all trees eased back a touch so they stay behind the UI */}
        <g opacity={0.85}>
        {/* far forest in violet haze */}
        <g filter="url(#fw-blur-far)" fill="#2a1a3a" opacity={0.55}>
          {scene.far.map((t, i) => (
            <path key={i} d={t.d} />
          ))}
          {scene.farCrown.map((l, i) => (
            <circle key={i} cx={l.cx} cy={l.cy} r={l.rad} />
          ))}
        </g>
        <rect x={0} y={H * 0.45} width={W} height={H * 0.4} fill="#3b1a4a" opacity={0.18} />

        {/* mid trees, slightly out of focus */}
        <g filter="url(#fw-blur-mid)">
          {scene.mid.map((t, i) => (
            <path key={i} d={t.d} fill="#150c1b" />
          ))}
          {scene.midCrown.map((l, i) => (
            <circle key={i} cx={l.cx} cy={l.cy} r={l.rad} fill={LEAVES[Math.floor(l.tone * LEAVES.length)]} opacity={0.8} />
          ))}
        </g>

        {/* near trees: dark silhouettes rim-lit pink on the side facing the glade's glow */}
        {scene.near.map((t, i) => (
          <g key={i}>
            <path d={t.d} fill="#f472b6" opacity={0.35} transform={`translate(${i ? -3 : 3} -1)`} />
            <path d={t.d} fill="#08050c" />
          </g>
        ))}
        {scene.drapes.map((v, i) => (
          <g key={i} fill="#c084fc" opacity={0.75}>
            {Array.from({ length: v.n }, (_, k) => (
              <circle key={k} cx={v.x + Math.sin(k * 1.3) * 2} cy={v.y + 6 + k * 7} r={5 - (k / v.n) * 3.5} fill={k % 2 ? "#f9a8d4" : undefined} />
            ))}
          </g>
        ))}
        {/* translucent, overlapping petal clouds rather than solid balls */}
        <g opacity={0.55} filter="url(#fw-blur-soft)">
          {scene.blossom.map((l, i) => (
            <circle key={i} cx={l.cx} cy={l.cy} r={l.rad} fill={BLOOMS[Math.floor(l.tone * BLOOMS.length)]} />
          ))}
        </g>

        </g>

        <path d={`M0 ${H}V${H - 40}Q400 ${H - 70} 800 ${H - 45}T${W} ${H - 50}V${H}Z`} fill="url(#fw-ground)" />
      </svg>

      {/* Mushroom light spill, in two layers that breathe out of phase. Kept out of the forest SVGs:
          animating inside an SVG repaints all of it (and re-runs its blur filters) every frame. */}
      {[0, 1].map((layer) => (
        <svg key={layer} className="fw-world fw-halos" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ animationDelay: `${-layer * 2}s` }} aria-hidden>
          {scene.shrooms
            .filter((s) => (s.delay < -2 ? 1 : 0) === layer)
            .map((s, i) => (
              <ellipse key={i} cx={s.x} cy={s.y - s.h + 4} rx={s.c * 3.2} ry={s.c * 2.4} fill={`url(#fw-halo-${s.color.slice(1)})`} />
            ))}
        </svg>
      ))}

      <svg className="fw-world" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>

        {/* bioluminescent mushrooms: light spill, shaded stem, translucent cap lit from below */}
        {scene.shrooms.map((s, i) => {
          const id = s.color.slice(1);
          const capY = s.y - s.h;
          return (
            <g key={i}>
              <path
                d={`M${f(s.x - s.c * 0.16)} ${f(s.y)}C${f(s.x - s.c * 0.2)} ${f(s.y - s.h * 0.5)} ${f(s.x + s.lean - s.c * 0.12)} ${f(capY + 6)} ${f(s.x + s.lean - s.c * 0.1)} ${f(capY)}H${f(s.x + s.lean + s.c * 0.1)}C${f(s.x + s.lean + s.c * 0.12)} ${f(capY + 6)} ${f(s.x + s.c * 0.2)} ${f(s.y - s.h * 0.5)} ${f(s.x + s.c * 0.16)} ${f(s.y)}Z`}
                fill="url(#fw-stem)"
              />
              <path
                d={`M${f(s.x + s.lean - s.c)} ${f(capY + 2)}C${f(s.x + s.lean - s.c)} ${f(capY - s.c * 1.05)} ${f(s.x + s.lean + s.c)} ${f(capY - s.c * 1.05)} ${f(s.x + s.lean + s.c)} ${f(capY + 2)}C${f(s.x + s.lean + s.c * 0.5)} ${f(capY - 2)} ${f(s.x + s.lean - s.c * 0.5)} ${f(capY - 2)} ${f(s.x + s.lean - s.c)} ${f(capY + 2)}Z`}
                fill={`url(#fw-cap-${id})`}
                style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}
              />
            </g>
          );
        })}

        {scene.grass.map((d, i) => (
          <path key={i} d={d} fill="url(#fw-grass)" />
        ))}
        {/* out-of-focus foreground blades */}
        <g filter="url(#fw-blur-fg)" opacity={0.85}>
          {scene.foreground.map((d, i) => (
            <path key={i} d={d} fill="#040a07" />
          ))}
        </g>
      </svg>

      <div className="fw-shafts">
        {[14, 32, 52, 70].map((left, i) => (
          <span key={i} className="fw-shaft" style={{ left: `${left}%`, animationDelay: `${-i * 3}s` }} />
        ))}
      </div>

      <div className="fw-bokeh">
        {scene.bokeh.map((b, i) => (
          <span
            key={i}
            className="fw-bokeh__dot"
            style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size, background: `radial-gradient(circle, ${b.color} 35%, transparent 70%)`, animationDuration: `${b.dur}s` }}
          />
        ))}
      </div>

      <div className="fw-fireflies">
        {scene.fireflies.map((fl, i) => (
          <span
            key={i}
            className="fw-firefly"
            style={{
              left: `${fl.left}%`,
              top: `${fl.top}%`,
              "--dx": `${fl.dx}px`,
              "--dy": `${fl.dy}px`,
              animationDuration: `${fl.tx}s`,
              animationDelay: `${fl.delay}s`,
            } as CSSProperties}
          >
            <span className="fw-firefly__y" style={{ animationDuration: `${fl.ty}s`, animationDelay: `${fl.delay}s` }}>
              <span className="fw-firefly__light" style={{ animationDuration: `${fl.blink}s`, animationDelay: `${fl.delay}s` }} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
