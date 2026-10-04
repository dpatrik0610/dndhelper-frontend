import { useMemo, type CSSProperties } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

/**
 * Crimson Dynasty: assassin over a Renaissance city at night. Crimson moon, rooftops with a
 * cathedral dome and smoking chimneys, a bell tower where a hooded assassin crouches on the
 * ledge (cape fluttering, blade glinting), an eagle circling the tower, banners swaying.
 * (Drifting ash = the shared particles.) Styles in styles/themes/crimson.css. Seeded = identical every load.
 */

const W = 1600;
const H = 900;
const TOWER = { x: 1130, w: 74, top: 330, base: 760 }; // bell tower; the assassin crouches on its ledge

interface House { x: number; w: number; h: number; roof: number; chimney: number | null; windows: { x: number; y: number }[] }

/** Row of houses with pitched roofs standing on `baseY`; some chimneys, some lit windows. */
function rooftops(r: () => number, baseY: number, minH: number, maxH: number, litChance: number): House[] {
  const out: House[] = [];
  for (let x = -20; x < W + 20; ) {
    const w = 60 + r() * 90;
    const h = minH + r() * (maxH - minH);
    const windows: House["windows"] = [];
    for (let wy = baseY - h + 18; wy < baseY - 20; wy += 34) {
      for (let wx = x + 12; wx < x + w - 14; wx += 26) if (r() < litChance) windows.push({ x: wx, y: wy });
    }
    out.push({ x, w, h, roof: 22 + r() * 30, chimney: r() < 0.35 ? x + w * (0.2 + r() * 0.6) : null, windows });
    x += w - 4 + r() * 6;
  }
  return out;
}

const houseShape = (hs: House, baseY: number) => {
  const top = baseY - hs.h;
  return `M${hs.x} ${baseY}V${top}L${hs.x + hs.w / 2} ${top - hs.roof}L${hs.x + hs.w} ${top}V${baseY}Z`;
};

export function CrimsonBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(1503);
    return {
      far: rooftops(r, 700, 90, 200, 0),
      near: rooftops(r, 900, 110, 230, 0.12),
    };
  }, []);

  const t = TOWER;
  const ledgeY = t.top + 70;

  return (
    <div className={`theme-scene cr-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="cr-sky" />
      <div className="cr-moon" />
      <div className="cr-clouds">
        <span className="cr-cloud" style={{ top: "18%", animationDuration: "110s" }} />
        <span className="cr-cloud" style={{ top: "29%", animationDuration: "150s", animationDelay: "-70s" }} />
      </div>

      <svg className="cr-world" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden>
        <defs>
          <linearGradient id="cr-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7f1d1d" stopOpacity="0.35" />
            <stop offset="1" stopColor="#7f1d1d" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* far city: hazy crimson silhouettes, cathedral dome */}
        <g className="cr-far">
          {scene.far.map((hs, i) => (
            <path key={i} d={houseShape(hs, 700)} />
          ))}
          <path d="M380 700V560H400A110 110 0 0 1 620 560H640V700Z" />
          <rect x={498} y={428} width={24} height={30} />
          <path d="M510 400L520 428H500Z" />
        </g>
        <rect x={0} y={600} width={W} height={160} fill="url(#cr-haze)" />

        {/* bell tower with belfry arches, spire and swaying banners */}
        <g className="cr-tower">
          <rect x={t.x} y={t.top + 70} width={t.w} height={t.base - t.top - 70} />
          <rect x={t.x - 8} y={ledgeY - 6} width={t.w + 16} height={8} />
          <path d={`M${t.x - 4} ${t.top + 70}L${t.x + t.w / 2} ${t.top - 40}L${t.x + t.w + 4} ${t.top + 70}Z`} />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="cr-belfry"
              d={`M${t.x + 10 + i * 20} ${ledgeY + 50}v-24a6 6 0 0 1 12 0v24z`}
            />
          ))}
          <path className="cr-banner" d={`M${t.x + 6} ${ledgeY + 70}h16v70l-8 -10l-8 10z`} />
          <path className="cr-banner cr-banner--2" d={`M${t.x + t.w - 22} ${ledgeY + 70}h16v62l-8 -10l-8 10z`} />
        </g>

        {/* the assassin, crouched on the left end of the ledge, facing left */}
        <g className="cr-assassin" transform={`translate(${t.x - 2} ${ledgeY - 6})`}>
          <path className="cr-assassin__cape" d="M6 -44Q28 -40 36 -20Q31 -14 22 -10Q18 -26 8 -30Z" />
          <path d="M-14 0L-9 -17L-17 -29L-11 -42L-13 -52C-12 -64 2 -67 7 -56L9 -44L15 -35L23 -29L21 -23L10 -25L8 -17L16 0Z" />
          <line className="cr-blade" x1={-17} y1={-29} x2={-31} y2={-23} />
        </g>

        {/* eagle circling the tower top: x and y oscillate a quarter-cycle apart = elliptical orbit;
            the bird is symmetric (wings spread), so it never needs to turn */}
        <g transform={`translate(${t.x + t.w / 2} ${t.top - 90})`}>
          <g className="cr-orbit-x">
            <g className="cr-orbit-y">
              <path
                className="cr-eagle"
                d="M0 0C-6 -3 -14 -9 -24 -8C-16 -4 -10 -1 -6 1C-10 3 -14 7 -16 10C-8 8 -3 4 0 2C3 4 8 8 16 10C14 7 10 3 6 1C10 -1 16 -4 24 -8C14 -9 6 -3 0 0Z"
              />
            </g>
          </g>
        </g>

        {/* near rooftops with chimneys (smoke) and a few lit windows */}
        <g className="cr-near">
          {scene.near.map((hs, i) => (
            <g key={i}>
              <path d={houseShape(hs, 900)} />
              {hs.chimney !== null && (
                <>
                  <rect x={hs.chimney} y={900 - hs.h - hs.roof * 0.7} width={10} height={hs.roof * 0.7 + 4} />
                  <circle className="cr-smoke" cx={hs.chimney + 5} cy={900 - hs.h - hs.roof * 0.7 - 8} r={9} style={{ animationDelay: `${(i % 5) * -1.3}s` } as CSSProperties} />
                  <circle className="cr-smoke" cx={hs.chimney + 5} cy={900 - hs.h - hs.roof * 0.7 - 8} r={7} style={{ animationDelay: `${(i % 5) * -1.3 - 3}s` } as CSSProperties} />
                </>
              )}
              {hs.windows.map((w, k) => (
                <rect key={k} className="cr-window" x={w.x} y={w.y} width={8} height={13} rx={1} />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
