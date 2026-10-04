/**
 * Meshing gear trains for the Clockwork backdrop.
 *
 * All gears share one tooth size (module): pitch radius = MODULE * teeth. Meshing gears sit exactly
 * (r1 + r2) apart, turn in opposite directions, and their periods scale with tooth count, so the
 * tooth-vs-gap alignment at the contact point holds for all time. Teeth are centred at angles
 * start + k·360/n (degrees, clockwise from +x, screen coordinates).
 */

export const MODULE = 3.2; // px of pitch radius per tooth

export interface Gear {
  teeth: number;
  x: number; // centre, px, relative to the train origin
  y: number;
  start: number; // initial rotation (deg)
  dir: 1 | -1; // 1 = clockwise
  period: number; // seconds per revolution
}

export const pitchRadius = (teeth: number) => MODULE * teeth;

/**
 * Build a train: the first gear at (0,0); each next gear meshes with the previous one, placed in the
 * direction `angle` (deg) from it. `period0` = seconds per turn of the first gear.
 */
export function buildTrain(spec: { teeth: number; angle?: number }[], period0: number): Gear[] {
  const first = spec[0];
  const gears: Gear[] = [{ teeth: first.teeth, x: 0, y: 0, start: 0, dir: 1, period: period0 }];
  for (let i = 1; i < spec.length; i++) {
    const prev = gears[i - 1];
    const n = spec[i].teeth;
    const step = 360 / prev.teeth;
    // snap the contact direction onto one of prev's tooth centres
    const wanted = spec[i].angle ?? 0;
    const k = Math.round((wanted - prev.start) / step);
    const theta = prev.start + k * step;
    const dist = pitchRadius(prev.teeth) + pitchRadius(n);
    const rad = (theta * Math.PI) / 180;
    gears.push({
      teeth: n,
      x: prev.x + Math.cos(rad) * dist,
      y: prev.y + Math.sin(rad) * dist,
      // put a gap (half a tooth step off a tooth centre) facing back at prev's tooth
      start: theta + 180 - 180 / n,
      dir: (prev.dir * -1) as 1 | -1,
      period: prev.period * (n / prev.teeth),
    });
  }
  return gears;
}

/** The Clockwork scene's trains (origin = first gear's centre; y grows downward). */
export const CLOCKWORK_TRAINS = [
  { key: "bl", className: "cw-train cw-train--bl", gears: buildTrain([{ teeth: 44 }, { teeth: 22, angle: -20 }, { teeth: 14, angle: -80 }], 70) },
  { key: "tr", className: "cw-train cw-train--tr", gears: buildTrain([{ teeth: 36 }, { teeth: 18, angle: 160 }, { teeth: 28, angle: 100 }], 60) },
];

/**
 * Gear outline (teeth) plus spoke windows and axle hole, as one even-odd path centred on 0,0.
 * Tooth k is centred at angle k·360/n.
 */
export function gearPath(teeth: number, spokes = 5): string {
  const rp = pitchRadius(teeth);
  const ro = rp + MODULE; // addendum
  const rr = rp - MODULE * 1.25; // dedendum
  const step = (Math.PI * 2) / teeth;
  const pt = (r: number, a: number) => `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
  let d = "";
  for (let k = 0; k < teeth; k++) {
    const c = k * step;
    // root → flank up → tip → flank down (tip narrower than root = trapezoid tooth)
    d += `${k === 0 ? "M" : "L"}${pt(rr, c - step * 0.5)}L${pt(rr, c - step * 0.27)}L${pt(ro, c - step * 0.15)}L${pt(ro, c + step * 0.15)}L${pt(rr, c + step * 0.27)}`;
  }
  d += "Z";

  // spoke windows: annular sectors between `spokes` arms
  const r1 = rr * 0.78;
  const r2 = rr * 0.34;
  const arm = 0.22; // fraction of each sector taken by the arm
  const sector = (Math.PI * 2) / spokes;
  if (rr > 30) {
    for (let s = 0; s < spokes; s++) {
      const a0 = s * sector + sector * arm * 0.5;
      const a1 = (s + 1) * sector - sector * arm * 0.5;
      d += `M${pt(r1, a0)}A${r1.toFixed(2)} ${r1.toFixed(2)} 0 0 1 ${pt(r1, a1)}L${pt(r2, a1)}A${r2.toFixed(2)} ${r2.toFixed(2)} 0 0 0 ${pt(r2, a0)}Z`;
    }
  }
  // axle hole
  const ra = Math.max(4, rr * 0.12);
  d += `M${ra} 0A${ra} ${ra} 0 1 0 ${-ra} 0A${ra} ${ra} 0 1 0 ${ra} 0Z`;
  return d;
}
