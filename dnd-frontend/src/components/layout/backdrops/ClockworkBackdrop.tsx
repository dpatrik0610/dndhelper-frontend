import { useMemo, type CSSProperties } from "react";
import type { BackdropProps } from "./index";
import { CLOCKWORK_TRAINS, gearPath, pitchRadius, MODULE, type Gear } from "./gearTrain";

/**
 * Clockwork Brass: minimal steampunk as fine brass line-art on dark paper (an engraving / blueprint),
 * with lots of empty space. Two truly meshing gear trains (gearTrain.ts) in outline frame the
 * bottom-left and top-right corners, a double-walled pipe with flanges and a valve runs down the right
 * side to a pressure gauge whose needle twitches in mechanical steps, a thin steam wisp rises from the
 * valve, and two engraved plate labels annotate it. Styles in styles/themes/clockwork.css.
 */

function GearOutline({ gear }: { gear: Gear }) {
  const rp = pitchRadius(gear.teeth);
  const ro = rp + MODULE;
  const d = useMemo(() => gearPath(gear.teeth), [gear.teeth]);
  const axle = Math.max(7, rp * 0.16);
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
        <path className="cw-ink" d={d} fillRule="evenodd" />
        <circle className="cw-ink cw-ink--faint cw-ink--dash" r={rp} />
        <circle className="cw-ink" r={axle} />
        <path className="cw-ink cw-ink--faint" d={`M${-axle * 1.8} 0H${axle * 1.8}M0 ${-axle * 1.8}V${axle * 1.8}`} />
      </svg>
    </span>
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

export function ClockworkBackdrop({ isStatic = false }: BackdropProps) {
  return (
    <div className={`theme-scene cw-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="cw-paper" />

      {CLOCKWORK_TRAINS.map((t) => (
        <div key={t.key} className={t.className}>
          {t.gears.map((g, i) => (
            <GearOutline key={i} gear={g} />
          ))}
        </div>
      ))}

      {/* pipe run, valve, steam and gauge — fixed-size px, anchored to the top-right corner (x = px
          from the right edge, negative), so it stays registered with the px-positioned gears.
          The top-right train's lowest gear reaches ~346px down and spans 196–380px from the right. */}
      <svg className="cw-plumbing" viewBox="-560 0 560 900" aria-hidden>
        {/* double-walled pipe: runs below the gears, then bends down the right side to the gauge */}
        <path className="cw-ink" d="M-340 372H-96Q-70 372 -70 398V470" />
        <path className="cw-ink" d="M-340 384H-96Q-82 384 -82 398V470" />
        {/* flanges */}
        <path className="cw-ink" d="M-280 366V390M-276 366V390M-190 366V390M-186 366V390M-88 440H-64M-88 444H-64" />
        {/* valve on top of the pipe, clear of the gears */}
        <path className="cw-ink" d="M-130 372V358M-142 358H-118M-136 352H-124" />
        <path className="cw-ink cw-ink--faint cw-steam" d="M-130 346C-140 332 -120 322 -130 306C-140 290 -122 280 -132 264" />
        {/* gauge */}
        <g transform="translate(-76 520)">
          <circle className="cw-ink" r={48} />
          <circle className="cw-ink cw-ink--faint" r={44} />
          {GAUGE_TICKS.map((tk, i) => (
            <line key={i} className={tk.major ? "cw-ink" : "cw-ink cw-ink--faint"} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2} />
          ))}
          <g className="cw-needle">
            <path className="cw-ink" d="M0 0L26 0" />
            <circle className="cw-ink" r={3.5} />
          </g>
          <text className="cw-label" y={26} textAnchor="middle">psi</text>
        </g>
        <text className="cw-label cw-label--plate" x={-76} y={598} textAnchor="middle">Fig. II</text>
      </svg>

      {/* engraved dimension line: exactly the pitch diameter of the bottom-left train's middle gear
          (22 teeth → 140.8px), drawn just above that gear */}
      <svg className="cw-annotation" viewBox="0 0 300 70" aria-hidden>
        <text className="cw-label cw-label--plate" x={10} y={14}>Fig. I — Escapement train</text>
        <path className="cw-ink cw-ink--faint" d="M10 46H150.8M10 40V52M150.8 40V52M16 42L10 46L16 50M144.8 42L150.8 46L144.8 50" />
        <text className="cw-label" x={80.4} y={38} textAnchor="middle">140.8</text>
      </svg>
    </div>
  );
}
