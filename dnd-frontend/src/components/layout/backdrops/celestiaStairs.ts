export const STEPS = 16;
export const BOTTOM_Y = 900;
export const TOP_Y = 500;
const HORIZON = 480;
const BOTTOM_HALF = 380;
const DEPTH_STEP = 0.153;
const EYE = BOTTOM_Y - HORIZON;
const RISE = (EYE - (TOP_Y - HORIZON) * (1 + STEPS * DEPTH_STEP)) / STEPS;
const RAIL = 1.6;

export const depthAt = (i: number) => 1 + i * DEPTH_STEP;
const project = (height: number, z: number) => HORIZON + (EYE - height * RISE) / z;
export const halfAt = (z: number) => BOTTOM_HALF / z;
export const riseAt = (z: number) => RISE / z;
export const railY = (z: number) => project((z - 1) / DEPTH_STEP + 1 + RAIL, z);

export interface Step {
  z: number;
  bottom: number;
  nose: number;
  top: number;
  front: number;
  back: number;
}

export function buildStairs(): Step[] {
  return Array.from({ length: STEPS }, (_, i) => {
    const z = depthAt(i);
    const zb = depthAt(i + 1);
    return { z, bottom: project(i, z), nose: project(i + 1, z), top: project(i + 1, zb), front: halfAt(z), back: halfAt(zb) };
  });
}

export function outline(steps: Step[], side: number): [number, number][] {
  return steps.flatMap((s) => [
    [side * s.front, s.bottom],
    [side * s.front, s.nose],
    [side * s.back, s.top],
  ] as [number, number][]);
}

export const POSTS = [0, 3, 6, 9, 12, 15];
