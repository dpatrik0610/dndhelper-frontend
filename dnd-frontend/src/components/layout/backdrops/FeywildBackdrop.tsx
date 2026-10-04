import { useMemo, type CSSProperties } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Feywild Bloom: an enchanted twilight forest. Depth comes from layered trunks (far = heavily blurred
 * in violet haze, near = sharp with cylindrical bark shading and flared roots), a soft foliage canopy
 * lit pink at its edges, bioluminescent mushrooms lit from within, gradient grass with blurred
 * foreground blades (depth of field), soft light shafts, wandering fireflies and out-of-focus bokeh.
 * (Spinning petals = the shared particles.) Styles in styles/themes/feywild.css. Seeded = identical every load.
 */

const W = 1600;
const H = 900;
const f = (n: number) => n.toFixed(1);
const GLOWS = ["#f472b6", "#5eead4", "#c084fc", "#fbbf24"];

/** Tapered trunk from the top edge to the ground, flaring into roots at the base. */
function trunk(x: number, topW: number, baseW: number, lean: number) {
  const l0 = x - topW / 2;
  const r0 = x + topW / 2;
  const lb = x + lean - baseW / 2;
  const rb = x + lean + baseW / 2;
  return (
    `M${f(l0)} 0C${f(l0 - 4)} ${H * 0.4} ${f(lb + baseW * 0.15)} ${H * 0.75} ${f(lb - baseW * 0.35)} ${H}` +
    `H${f(rb + baseW * 0.35)}C${f(rb - baseW * 0.15)} ${H * 0.75} ${f(r0 + 4)} ${H * 0.4} ${f(r0)} 0Z`
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
    const far = Array.from({ length: 9 }, (_, i) => trunk(90 + i * 180 + r() * 60, 26 + r() * 20, 40 + r() * 20, (r() - 0.5) * 30));
    const mid = [250, 610, 1010, 1330].map((x) => trunk(x + r() * 40, 40 + r() * 16, 70 + r() * 30, (r() - 0.5) * 40));
    const foliage = Array.from({ length: 46 }, () => ({ cx: r() * W, cy: -20 + r() * 150, rad: 40 + r() * 70 }));
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
    return { far, mid, foliage, shrooms, grass, foreground, fireflies, bokeh };
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
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id="fw-blur-fg" x="-50%" y="-10%" width="200%" height="120%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          {/* cylindrical bark shading: dark edges, pink-lit side */}
          <linearGradient id="fw-bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#07040b" />
            <stop offset="0.35" stopColor="#1c1222" />
            <stop offset="0.62" stopColor="#3a2234" />
            <stop offset="0.85" stopColor="#140c18" />
            <stop offset="1" stopColor="#060309" />
          </linearGradient>
          <radialGradient id="fw-leaf" cx="0.5" cy="0.35" r="0.65">
            <stop offset="0" stopColor="#0b1a12" />
            <stop offset="0.78" stopColor="#0f2418" />
            <stop offset="1" stopColor="#5b2a4a" />
          </radialGradient>
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

        {/* far forest in violet haze */}
        <g filter="url(#fw-blur-far)" fill="#2a1a3a" opacity={0.55}>
          {scene.far.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <rect x={0} y={H * 0.45} width={W} height={H * 0.4} fill="#3b1a4a" opacity={0.18} />
        <g filter="url(#fw-blur-mid)">
          {scene.mid.map((d, i) => (
            <path key={i} d={d} fill="url(#fw-bark)" opacity={0.85} />
          ))}
        </g>

        {/* near trunks framing the glade */}
        <path d={trunk(70, 120, 200, 10)} fill="url(#fw-bark)" />
        <path d={trunk(1530, 130, 210, -12)} fill="url(#fw-bark)" />

        {/* canopy: soft foliage masses, pink-lit at the edges */}
        <g filter="url(#fw-blur-mid)">
          {scene.foliage.map((l, i) => (
            <circle key={i} cx={l.cx} cy={l.cy} r={l.rad} fill="url(#fw-leaf)" />
          ))}
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
