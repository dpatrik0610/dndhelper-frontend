import { useMemo, type CSSProperties, type ReactNode } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";
import { CLOCKWORK_TRAINS, BL_ORIGIN, TR_ORIGIN, gearPath, pitchRadius, MODULE, type Gear } from "./gearTrain";

/**
 * Clockwork Brass: an engraved plate from an artificer's treatise, in brass ink on aged dark paper,
 * lit by a guttering desk lamp. Everything is one works, connected the way a real one would be:
 *
 *   water main (top edge) ─┬→ boiler over a firebox → steam pipe, gauge and safety valve → cylinder →
 *                          │  piston, crosshead and connecting rod → crank on gear F → train F·E·D
 *                          │  (top right) → belt pulley on D → belt down the right edge and along the
 *                          │  bottom → pulley on A → train A·B·C (bottom left)
 *                          └→ water crane → tender of a locomotive standing in steam on the siding
 *                             (bottom right)
 *
 * The rod/piston keyframes are computed from gear F's actual rotation, so the linkage stays attached
 * to the crank pin; the exhaust chuffs at each dead centre; the safety valve blows as the gauge peaks.
 * Two huge faint gears turn behind it all for depth. Styles in styles/themes/clockwork.css.
 */

const PULLEY_R = 20; // belt pulleys on D, the corner idler and A

const TR = CLOCKWORK_TRAINS.find((t) => t.key === "tr")!;

function GearOutline({ gear, deep, children }: { gear: Gear; deep?: boolean; children?: ReactNode }) {
  const rp = pitchRadius(gear.teeth);
  const ro = rp + MODULE;
  const d = useMemo(() => gearPath(gear.teeth, deep ? 8 : 5), [gear.teeth, deep]);
  const axle = Math.max(4, rp * 0.16);
  return (
    <span
      className="cw-gear"
      style={{
        left: gear.x - ro,
        top: gear.y - ro,
        width: ro * 2,
        height: ro * 2,
        "--start": `${gear.start}deg`,
        "--turn": `${gear.dir * 360}deg`,
        "--period": `${gear.period}s`,
      } as CSSProperties}
    >
      <svg viewBox={`${-ro - 1} ${-ro - 1} ${ro * 2 + 2} ${ro * 2 + 2}`} aria-hidden>
        {!deep && <path className="cw-hatch" d={d} fillRule="evenodd" />}
        <path className="cw-ink" d={d} fillRule="evenodd" />
        <circle className="cw-ink cw-ink--faint cw-ink--dash" r={rp} />
        <circle className="cw-ink" r={axle} />
        {!deep && <circle className="cw-ink cw-ink--faint" r={axle * 1.7} />}
        <path className="cw-ink cw-ink--faint" d={`M${-axle * 1.8} 0H${axle * 1.8}M0 ${-axle * 1.8}V${axle * 1.8}`} />
        {children}
      </svg>
    </span>
  );
}

/** Belt pulley drawn in its arbor's frame: rim, groove and four spokes. */
function Pulley() {
  const r = PULLEY_R;
  return (
    <>
      <circle className="cw-ink" r={r} />
      <circle className="cw-ink cw-ink--faint" r={r - 3} />
      <path className="cw-ink cw-ink--faint" d={`M${-r + 3} 0H${r - 3}M0 ${-r + 3}V${r - 3}`} />
      <circle className="cw-ink" r={3} />
    </>
  );
}

/** Pipes are drawn as a brass stroke with a narrower paper-coloured stroke on top: two walls that
    follow any bend. Fluid dashes then run along the same centre line. */
function Pipe({ d, fluid }: { d: string; fluid?: "water" | "steam" }) {
  return (
    <>
      <path className="cw-pipe" d={d} />
      <path className="cw-pipe-bore" d={d} />
      {fluid && <path className={`cw-flow cw-flow--${fluid}`} d={d} />}
    </>
  );
}

/** Gauge tick marks over a 270° arc (−225° … +45°, clockwise from +x). */
const GAUGE_TICKS = Array.from({ length: 28 }, (_, i) => {
  const a = ((-225 + (270 / 27) * i) * Math.PI) / 180;
  const major = i % 9 === 0;
  const r1 = 40;
  const r2 = major ? 31 : 35;
  return { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1, x2: Math.cos(a) * r2, y2: Math.sin(a) * r2, major };
});

/* ---------- Engine (top right; engine SVG coords: x = px from the right edge, negative; y from top) ---------- */

const F_GEAR = TR.gears[2];
const CX = -TR_ORIGIN.right + F_GEAR.x; // crank axis = gear F's centre
const CY = TR_ORIGIN.top + F_GEAR.y;
const ENGINE_PERIOD = F_GEAR.period;
const CRANK = 34;
const ROD = 150; // connecting rod, crank pin → crosshead
const PISTON_ROD = 96; // crosshead → piston
const YC_MIN = CY - CRANK + ROD; // crosshead travel (top/bottom dead centre)
const YC_MAX = CY + CRANK + ROD;

/** Crosshead height and connecting-rod tilt at fraction f of a crank turn. The pin is drawn at local
    angle 0 on gear F, so its screen angle is exactly F's own rotation. */
function linkage(f: number) {
  const th = ((F_GEAR.start + F_GEAR.dir * 360 * f) * Math.PI) / 180;
  const px = CRANK * Math.cos(th);
  const yc = CY + CRANK * Math.sin(th) + Math.sqrt(ROD * ROD - px * px);
  return { yc, tilt: (Math.asin(px / ROD) * 180) / Math.PI };
}

/** Sampled keyframes (linear between 48 samples): close enough that the rod never visibly leaves the pin. */
const ENGINE_KEYFRAMES = (() => {
  let rod = "";
  let head = "";
  for (let i = 0; i <= 48; i++) {
    const { yc, tilt } = linkage(i / 48);
    const pct = ((i / 48) * 100).toFixed(3);
    rod += `${pct}%{transform:translate(${CX.toFixed(2)}px,${yc.toFixed(2)}px) rotate(${tilt.toFixed(2)}deg)}`;
    head += `${pct}%{transform:translateY(${yc.toFixed(2)}px)}`;
  }
  return `@keyframes cwRod{${rod}}@keyframes cwCrosshead{${head}}`;
})();
const LINK0 = linkage(0);

/** Exhaust chuffs twice a turn, at the dead centres (pin straight above or below the axis). */
const CHUFF_DELAY = (() => {
  const f = ((((-90 - F_GEAR.start) * F_GEAR.dir) % 180) + 180) % 180 / 360;
  return f * ENGINE_PERIOD - ENGINE_PERIOD / 2; // negative = already in phase at mount
})();

/** Boiler: well below and left of gear F (≥100px clear). Body top/bottom, domed ends 20px. */
const BX = -520;
const BOILER_TOP = 330;
const BOILER_BOTTOM = 470;
const CUTAWAY = `M-552 450V354${"l6 -4l6 4".repeat(3)}l6 -4l4 3V450Z`;
/** Water surface: 24px waves, wide enough to slide one wave right and still cover the window. */
const WAVE = `M-608 382${"q6 -3 12 0t12 0".repeat(5)}V456H-608Z`;
const BUBBLES = [
  { x: -546, r: 1.8, dur: 3.2, delay: 0 },
  { x: -536, r: 1.2, dur: 2.6, delay: -1.1 },
  { x: -528, r: 2.2, dur: 3.8, delay: -2.3 },
  { x: -520, r: 1.5, dur: 2.9, delay: -0.6 },
  { x: -512, r: 1.3, dur: 3.4, delay: -1.8 },
];
/** Safety-valve burst: puffs ~0.2s apart, at 4.8s into the 7s cycle — when the gauge needle
    (cwNeedle, also 7s) jumps to its peak. */
const BURST = [-14, -6, -18, -9, -12].map((drift, i) => ({ drift, delay: 4.8 + i * 0.22 }));
const COALS = [
  { x: -532, rx: 5, d: 0 },
  { x: -524, rx: 4, d: -0.7 },
  { x: -515, rx: 6, d: -1.3 },
  { x: -507, rx: 4, d: -0.4 },
];

/** Water main: down from the top edge to a tee at MAIN_TEE, branching right into the boiler; the
    main carries on down to the water crane (an HTML pipe, since its length depends on the viewport). */
const MAIN_X = -585;
const MAIN_TEE = 400;
const FEED_PIPE = `M${MAIN_X} -20V${MAIN_TEE + 20}M${MAIN_X} ${MAIN_TEE}H${BX - 42}`;
const STEAM_PIPE = `M-505 312V296Q-505 286 -495 286H-460Q-450 286 -450 296V466Q-450 476 -440 476H${CX - 46}`;
const STACK_X = CX + 83;
/** Exhaust leaves the cylinder's flank, so nothing hangs below the cylinder. */
const EXHAUST_PIPE = `M${CX + 26} 516H${STACK_X - 10}Q${STACK_X} 516 ${STACK_X} 506V424`;

/* ---------- Locomotive (bottom right; loco SVG coords: x from the right edge, y from the bottom, both negative) ---------- */

const RAIL = -76; // top of rail: clear above the belt's inner run (60px up)
const y = (dy: number) => RAIL + dy;
const CRANE_TOP = -215; // where the HTML water column hands over to the crane head
const FILLER_X = -548; // tender filler, under the crane's leather bag
const SLEEPERS = Array.from({ length: 31 }, (_, i) => -700 + i * 18);
const DRIVER_R = 22;
const DRIVERS = [-400, -340];
const CRANK_PIN = { dx: 12 * Math.cos((130 * Math.PI) / 180), dy: 12 * Math.sin((130 * Math.PI) / 180) };

function Wheel({ cx, r, spokes, pin }: { cx: number; r: number; spokes: number; pin?: boolean }) {
  const cy = RAIL - r;
  let d = "";
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    d += `M${(cx + Math.cos(a) * 3).toFixed(1)} ${(cy + Math.sin(a) * 3).toFixed(1)}L${(cx + Math.cos(a) * (r - 4)).toFixed(1)} ${(cy + Math.sin(a) * (r - 4)).toFixed(1)}`;
  }
  return (
    <>
      <circle className="cw-solid" cx={cx} cy={cy} r={r} />
      <circle className="cw-ink" cx={cx} cy={cy} r={r} />
      <circle className="cw-ink cw-ink--faint" cx={cx} cy={cy} r={r - 3} />
      <path className="cw-ink cw-ink--faint" d={d} />
      <circle className="cw-ink" cx={cx} cy={cy} r={2.5} />
      {pin && <circle className="cw-ink" cx={cx + CRANK_PIN.dx} cy={cy + CRANK_PIN.dy} r={2.5} />}
    </>
  );
}

const SMOKE = [0, 1, 2].map((i) => ({ delay: -i * 1.4, drift: [-20, -34, -12][i] }));

export function ClockworkBackdrop({ isStatic = false }: BackdropProps) {
  // dust motes drifting through the lamplight (percent of the viewport, inside the glow)
  const motes = useMemo(() => {
    const r = seededRandom(1888);
    return Array.from({ length: 26 }, () => ({
      left: 22 + r() * 46,
      top: 4 + r() * 55,
      size: 1 + r() * 2,
      dx: (r() - 0.5) * 80,
      dy: -20 - r() * 70,
      dur: 18 + r() * 22,
      delay: -r() * 40,
    }));
  }, []);

  /** Parts that ride on a particular gear's arbor, drawn inside it so they turn with it. */
  const onGear: Record<string, ReactNode> = {
    // belt pulleys on D and A
    tr0: <Pulley />,
    bl0: <Pulley />,
    // crank web and pin on F
    tr2: (
      <>
        <path className="cw-ink" d={`M0 -6L${CRANK} -5M0 6L${CRANK} 5`} />
        <circle className="cw-ink" cx={CRANK} r={7} />
        <circle className="cw-ink" cx={CRANK} r={3} />
      </>
    ),
  };

  const [rearPin, frontPin] = DRIVERS.map((x) => ({ x: x + CRANK_PIN.dx, y: RAIL - DRIVER_R + CRANK_PIN.dy }));

  return (
    <div className={`theme-scene cw-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <style>{ENGINE_KEYFRAMES}</style>
      {/* shared defs: section hatching for the foreground gears, soft steam, smoke and fire */}
      <svg className="cw-defs" width="0" height="0" aria-hidden>
        <defs>
          <pattern id="cw-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0V5" stroke="#c9a24a" strokeWidth="0.7" />
          </pattern>
          <radialGradient id="cw-puff">
            <stop offset="0%" stopColor="#e9dcc2" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e9dcc2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cw-smoke">
            <stop offset="0%" stopColor="#8d8273" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8d8273" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cw-fire">
            <stop offset="0%" stopColor="#ff9a3c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ff6a1a" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <div className="cw-paper" />
      <div className="cw-grain" />
      <div className="cw-lamp" />
      <div className="cw-plate" />

      {motes.map((m, i) => (
        <span
          key={i}
          className="cw-mote"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            "--dx": `${m.dx}px`,
            "--dy": `${m.dy}px`,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
          } as CSSProperties}
        />
      ))}

      {/* belt: D's pulley → down the right edge → corner idler → along the bottom → A's pulley and back.
          Outer run on the outside of the loop, inner run inside it, PULLEY_R either side of the axles. */}
      <span className="cw-belt cw-belt--down" style={{ right: TR_ORIGIN.right - PULLEY_R - 1, top: TR_ORIGIN.top, bottom: BL_ORIGIN.bottom }} />
      <span className="cw-belt cw-belt--up" style={{ right: TR_ORIGIN.right + PULLEY_R - 1, top: TR_ORIGIN.top, bottom: BL_ORIGIN.bottom + PULLEY_R }} />
      <span className="cw-belt cw-belt--left" style={{ left: BL_ORIGIN.left, right: TR_ORIGIN.right, bottom: BL_ORIGIN.bottom - PULLEY_R - 1 }} />
      <span className="cw-belt cw-belt--right" style={{ left: BL_ORIGIN.left, right: TR_ORIGIN.right + PULLEY_R, bottom: BL_ORIGIN.bottom + PULLEY_R - 1 }} />
      <span className="cw-idler" style={{ right: TR_ORIGIN.right - PULLEY_R - 1, bottom: BL_ORIGIN.bottom - PULLEY_R - 1 }}>
        <svg viewBox={`${-PULLEY_R - 1} ${-PULLEY_R - 1} ${PULLEY_R * 2 + 2} ${PULLEY_R * 2 + 2}`} aria-hidden>
          <Pulley />
        </svg>
      </span>
      {/* jockey pulley guiding the inner run round the corner */}
      <span className="cw-jockey" style={{ right: TR_ORIGIN.right + PULLEY_R - 4, bottom: BL_ORIGIN.bottom + PULLEY_R - 4 }} />

      {/* water main, continued below the boiler tee down to the crane (length follows the viewport) */}
      <span className="cw-column" style={{ right: -MAIN_X - 6.5, top: MAIN_TEE + 10, bottom: -CRANE_TOP }} />

      {CLOCKWORK_TRAINS.map((t) => (
        <div key={t.key} className={`cw-train cw-train--${t.key}`} style={t.pos}>
          {t.gears.map((g, i) => (
            <GearOutline key={i} gear={g} deep={t.deep}>
              {onGear[`${t.key}${i}`]}
            </GearOutline>
          ))}
          {/* letter keys sit outside the turning gears, up and to the right of each rim */}
          {t.letters &&
            t.gears.map((g, i) => {
              const r = pitchRadius(g.teeth) + MODULE;
              return (
                <span key={`l${i}`} className="cw-letter" style={{ left: g.x + r * 0.74 + 6, top: g.y - r * 0.74 - 18 }}>
                  {t.letters[i]}
                </span>
              );
            })}
          {t.key === "bl" && (
            <span className="cw-caption" style={{ left: -40, top: t.gears[2].y - 80 }}>
              Fig. I — Belt-driven train
            </span>
          )}
        </div>
      ))}

      {/* the engine, anchored to the top-right corner so it registers with train D·E·F */}
      <svg className="cw-engine" viewBox="-640 0 640 900" aria-hidden>
        <defs>
          <clipPath id="cw-cutaway">
            <path d={CUTAWAY} />
          </clipPath>
          <clipPath id="cw-cylinder">
            <rect x={CX - 20} y={452} width={40} height={82} />
          </clipPath>
        </defs>

        {/* pipes first, so vessels sit over their ends */}
        <Pipe d={FEED_PIPE} fluid="water" />
        <Pipe d={STEAM_PIPE} fluid="steam" />
        <Pipe d={EXHAUST_PIPE} fluid="steam" />
        <path className="cw-ink" d={`M${MAIN_X - 12} 150H${MAIN_X + 12}M${MAIN_X - 12} 154H${MAIN_X + 12}`} />

        {/* firebox under the boiler: door with glowing coals, and the glow on the boiler's belly */}
        <ellipse className="cw-fireglow" cx={BX} cy={498} rx={70} ry={34} />
        <path className="cw-ink" d="M-566 495H-474V540H-566ZM-580 540H-460" />
        <path className="cw-ink cw-ink--faint" d="M-566 502H-474" />
        {COALS.map((c, i) => (
          <ellipse key={i} className="cw-coal" cx={c.x} cy={526} rx={c.rx} ry={2.6} style={{ animationDelay: `${c.d}s` }} />
        ))}
        <path className="cw-ink" d="M-538 510H-502V532H-538ZM-506 521H-500" />
        <path className="cw-ink cw-ink--faint" d="M-534 516H-506M-534 521H-510" />

        {/* boiler: riveted cylinder with domed ends */}
        <path
          className="cw-ink"
          d={`M${BX - 42} ${BOILER_TOP}V${BOILER_BOTTOM}M${BX + 42} ${BOILER_TOP}V${BOILER_BOTTOM}M${BX - 42} ${BOILER_TOP}A42 20 0 0 1 ${BX + 42} ${BOILER_TOP}M${BX - 42} ${BOILER_BOTTOM}A42 20 0 0 0 ${BX + 42} ${BOILER_BOTTOM}`}
        />
        <path className="cw-ink cw-ink--faint" d={`M${BX - 42} 340H${BX + 42}M${BX - 42} 460H${BX + 42}`} />
        {[340, 460].flatMap((ry) =>
          Array.from({ length: 10 }, (_, k) => <circle key={`r${ry}-${k}`} className="cw-ink cw-ink--faint" cx={BX - 38 + k * 8.4} cy={ry} r={1.1} />),
        )}
        <g clipPath="url(#cw-cutaway)">
          <g className="cw-wave">
            <path className="cw-fluid" d={WAVE} />
          </g>
          {BUBBLES.map((b, i) => (
            <circle key={i} className="cw-bubble" cx={b.x} cy={446} r={b.r} style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
          ))}
        </g>
        <path className="cw-ink" d={CUTAWAY} />

        {/* lever safety valve on the dome, venting as the pressure peaks */}
        <path className="cw-ink" d="M-540 312V302M-546 302H-534M-543 302V296H-537V302M-540 298L-563 292" />
        <circle className="cw-ink" cx={-566} cy={292} r={3.5} />
        {BURST.map((b, i) => (
          <circle
            key={i}
            className="cw-puff cw-puff--burst"
            cx={-540}
            cy={290}
            r={10}
            style={{ animationDelay: `${b.delay}s`, "--drift": `${b.drift}px` } as CSSProperties}
          />
        ))}
        <text className="cw-label cw-label--plate" x={-600} y={280} textAnchor="end">Fig. II — Boiler</text>

        {/* steam gauge on the steam line */}
        <path className="cw-ink" d="M-480 280V274" />
        <g transform="translate(-480 240) scale(0.66)">
          <circle className="cw-ink" r={52} />
          <circle className="cw-ink" r={48} />
          <circle className="cw-ink cw-ink--faint" r={44} />
          {GAUGE_TICKS.map((tk, i) => (
            <line key={i} className={tk.major ? "cw-ink" : "cw-ink cw-ink--faint"} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2} />
          ))}
          {/* red line for the danger zone */}
          <path className="cw-ink cw-ink--warn" d="M30.41 -27.38A41 41 0 0 1 28.99 28.99" />
          <g className="cw-needle">
            <path className="cw-ink" d="M-8 0L26 0" />
            <circle className="cw-ink" r={3.5} />
          </g>
          <text className="cw-label" y={26} textAnchor="middle">psi</text>
        </g>

        {/* cylinder with a cutaway onto the piston; valve chest on its flank */}
        <path className="cw-ink" d={`M${CX - 26} 446H${CX + 26}V540H${CX - 26}ZM${CX - 30} 446H${CX + 30}M${CX - 30} 540H${CX + 30}`} />
        <path className="cw-ink" d={`M${CX - 46} 462H${CX - 26}V522H${CX - 46}Z`} />
        <path className="cw-ink cw-ink--faint" d={`M${CX - 46} 492H${CX - 26}`} />
        <path className="cw-ink cw-ink--faint" d={`M${CX - 20} 534V452l10 -4l10 4l10 -4l10 4V534Z`} />
        <g clipPath="url(#cw-cylinder)">
          <g className="cw-crosshead" style={{ transform: `translateY(${LINK0.yc}px)`, animationDuration: `${ENGINE_PERIOD}s` }}>
            <rect className="cw-hatch" x={CX - 20} y={PISTON_ROD - 5} width={40} height={10} />
            <rect className="cw-ink" x={CX - 20} y={PISTON_ROD - 5} width={40} height={10} />
          </g>
        </g>

        {/* crosshead guides */}
        <path className="cw-ink" d={`M${CX - 12} ${YC_MIN - 14}V${YC_MAX + 14}M${CX + 12} ${YC_MIN - 14}V${YC_MAX + 14}`} />
        <path className="cw-ink cw-ink--faint" d={`M${CX - 18} ${YC_MIN - 14}H${CX + 18}`} />

        {/* crosshead and piston rod slide; the connecting rod rocks between crosshead and crank pin */}
        <g className="cw-crosshead" style={{ transform: `translateY(${LINK0.yc}px)`, animationDuration: `${ENGINE_PERIOD}s` }}>
          <path className="cw-ink" d={`M${CX - 1.5} 6V${PISTON_ROD - 5}M${CX + 1.5} 6V${PISTON_ROD - 5}`} />
          <rect className="cw-ink" x={CX - 10} y={-6} width={20} height={12} />
        </g>
        <g className="cw-rod" style={{ transform: `translate(${CX}px, ${LINK0.yc}px) rotate(${LINK0.tilt}deg)`, animationDuration: `${ENGINE_PERIOD}s` }}>
          <path className="cw-ink" d={`M-3 0L-2 ${-ROD}M3 0L2 ${-ROD}`} />
          <circle className="cw-ink" r={4} />
        </g>

        {/* exhaust stack, chuffing at each dead centre */}
        <path className="cw-ink" d={`M${STACK_X - 8} 424L${STACK_X - 12} 408H${STACK_X + 12}L${STACK_X + 8} 424`} />
        {[0, 1].map((i) => (
          <circle
            key={i}
            className="cw-puff cw-puff--chuff"
            cx={STACK_X}
            cy={402}
            r={8}
            style={{ animationDuration: `${ENGINE_PERIOD / 2}s`, animationDelay: `${CHUFF_DELAY + i * 0.18}s`, "--drift": `${i ? 10 : -6}px` } as CSSProperties}
          />
        ))}
      </svg>

      {/* the siding, anchored to the bottom-right corner: water crane, locomotive and tender, buffer stop */}
      <svg className="cw-loco" viewBox="-720 -240 720 240" aria-hidden>
        <defs>
          <linearGradient id="cw-track-fade" gradientUnits="userSpaceOnUse" x1={-720} x2={-600} y1={0} y2={0}>
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="cw-track-mask">
            <rect x={-720} y={RAIL - 10} width={720} height={30} fill="url(#cw-track-fade)" />
          </mask>
        </defs>

        {/* track: rail on sleepers, fading in from the left, ending at a buffer stop */}
        <g mask="url(#cw-track-mask)">
          <path className="cw-ink" d={`M-720 ${RAIL}H-140M-720 ${y(4)}H-140`} />
          <path className="cw-ink cw-ink--faint" d={SLEEPERS.map((x) => `M${x - 6} ${y(6)}H${x + 6}V${y(10)}H${x - 6}Z`).join("")} />
        </g>
        <path className="cw-ink" d={`M-150 ${RAIL}V${y(-34)}M-156 ${y(-34)}H-140M-150 ${y(-26)}L-132 ${RAIL}M-158 ${y(-30)}H-150`} />
        <circle className="cw-ink" cx={-160} cy={y(-30)} r={3} />

        {/* water crane: the column (fed by the main) turns over into a swinging arm and leather bag */}
        <Pipe d={`M${MAIN_X} ${CRANE_TOP}V${RAIL}`} />
        <Pipe d={`M${MAIN_X} ${CRANE_TOP - 10}V${CRANE_TOP + 8}Q${MAIN_X} ${CRANE_TOP + 22} ${MAIN_X + 14} ${CRANE_TOP + 22}H${FILLER_X - 10}Q${FILLER_X} ${CRANE_TOP + 22} ${FILLER_X} ${CRANE_TOP + 32}V${y(-92)}`} fluid="water" />
        <path className="cw-ink" d={`M${MAIN_X - 12} ${RAIL}H${MAIN_X + 12}V${y(-8)}H${MAIN_X - 12}Z`} />
        {/* water pouring into the tender: ripples spreading in the filler */}
        {[0, 1].map((i) => (
          <ellipse key={i} className="cw-ripple" cx={FILLER_X} cy={y(-86)} rx={6} ry={1.6} style={{ animationDelay: `${-i * 0.7}s` }} />
        ))}

        {/* tender: water tank with coal on top, solid so the crane column reads as behind it */}
        <path className="cw-solid cw-ink" d={`M-620 ${y(-80)}H-528V${y(-26)}H-620Z`} />
        <path className="cw-ink" d={`M-624 ${y(-80)}H-524M-624 ${y(-26)}H-524`} />
        <path className="cw-ink cw-ink--faint" d={`M-616 ${y(-80)}Q-606 ${y(-96)} -594 ${y(-86)}Q-584 ${y(-100)} -572 ${y(-84)}L-566 ${y(-80)}`} />
        <path className="cw-ink" d={`M${FILLER_X - 8} ${y(-80)}V${y(-86)}H${FILLER_X + 8}V${y(-80)}M${FILLER_X + 8} ${y(-86)}L${FILLER_X + 16} ${y(-94)}`} />
        <path className="cw-ink cw-ink--faint" d={Array.from({ length: 11 }, (_, k) => `M${-616 + k * 8.4} ${y(-31)}h0.1`).join("")} />
        {[-606, -574, -542].map((x) => (
          <Wheel key={x} cx={x} r={12} spokes={8} />
        ))}
        <path className="cw-ink" d={`M-524 ${y(-30)}H-516`} />

        {/* locomotive, facing right: cab, firebox, boiler, smokebox and chimney */}
        <path className="cw-ink" d={`M-516 ${y(-34)}V${y(-112)}M-462 ${y(-34)}V${y(-112)}M-520 ${y(-112)}Q-489 ${y(-122)} -458 ${y(-112)}`} />
        <path className="cw-ink cw-ink--faint" d={`M-508 ${y(-100)}H-470V${y(-70)}H-508Z`} />
        <ellipse className="cw-fireglow cw-fireglow--cab" cx={-489} cy={y(-52)} rx={22} ry={14} />
        <path className="cw-ink" d={`M-462 ${y(-96)}H-430V${y(-34)}M-430 ${y(-100)}H-282V${y(-56)}H-430Z`} />
        <path className="cw-ink cw-ink--faint" d={`M-400 ${y(-100)}V${y(-56)}M-350 ${y(-100)}V${y(-56)}M-310 ${y(-100)}V${y(-56)}`} />
        <path className="cw-ink" d={`M-282 ${y(-102)}H-250V${y(-54)}H-282Z`} />
        <path className="cw-ink" d={`M-272 ${y(-102)}V${y(-124)}M-260 ${y(-102)}V${y(-124)}M-276 ${y(-124)}H-256M-276 ${y(-128)}H-256M-276 ${y(-124)}V${y(-128)}M-256 ${y(-124)}V${y(-128)}`} />
        <path className="cw-ink" d={`M-372 ${y(-100)}Q-372 ${y(-114)} -360 ${y(-114)}Q-348 ${y(-114)} -348 ${y(-100)}`} />
        <path className="cw-ink" d={`M-444 ${y(-96)}V${y(-104)}M-436 ${y(-96)}V${y(-104)}M-447 ${y(-104)}H-433M-454 ${y(-96)}V${y(-110)}M-457 ${y(-110)}H-451`} />
        {/* footplate, frames, buffer beam and buffers */}
        <path className="cw-ink" d={`M-516 ${y(-34)}H-232M-510 ${y(-28)}H-246M-246 ${y(-44)}V${y(-24)}M-246 ${y(-38)}H-236M-236 ${y(-42)}V${y(-34)}`} />
        {/* outside cylinder with slide bars and crosshead */}
        <path className="cw-ink" d={`M-302 ${y(-42)}H-262V${y(-24)}H-302Z`} />
        <path className="cw-ink" d={`M-302 ${y(-36)}H-334M-302 ${y(-30)}H-334`} />
        <path className="cw-ink" d={`M-322 ${y(-38)}H-312V${y(-28)}H-322Z`} />

        {/* wheels: leading, two coupled drivers, trailing */}
        <Wheel cx={-272} r={11} spokes={8} />
        {DRIVERS.map((x) => (
          <Wheel key={x} cx={x} r={DRIVER_R} spokes={12} pin />
        ))}
        <Wheel cx={-482} r={12} spokes={8} />
        {/* coupling rod between the drivers, main rod from the crosshead to the front driver */}
        <path className="cw-ink" d={`M${rearPin.x} ${rearPin.y - 1.5}L${frontPin.x} ${frontPin.y - 1.5}M${rearPin.x} ${rearPin.y + 1.5}L${frontPin.x} ${frontPin.y + 1.5}`} />
        <path className="cw-ink" d={`M-317 ${y(-33)}L${frontPin.x} ${frontPin.y}`} />

        {/* standing in steam: chimney smoke, a feather at the safety valves, drain cocks hissing */}
        {SMOKE.map((s, i) => (
          <circle key={i} className="cw-smoke" cx={-266} cy={y(-134)} r={9} style={{ animationDelay: `${s.delay}s`, "--drift": `${s.drift}px` } as CSSProperties} />
        ))}
        {[0, 1].map((i) => (
          <circle key={i} className="cw-puff cw-puff--feather" cx={-440} cy={y(-108)} r={5} style={{ animationDelay: `${-i * 0.6}s` }} />
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={i} className="cw-puff cw-puff--drain" cx={-262} cy={y(-22)} r={6} style={{ animationDelay: `${i * 0.25}s` }} />
        ))}

        <text className="cw-label cw-label--plate" x={-640} y={y(-40)} textAnchor="end">Fig. III — Taking water</text>
      </svg>

      <div className="cw-cartouche">Plate VII · The Artificer&rsquo;s Engine</div>
    </div>
  );
}
