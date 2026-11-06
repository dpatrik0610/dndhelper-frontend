export type Easing = "inOut" | "in" | "out";

export const gainOf = (v: number) => (v <= 0 ? 0 : 10 ** ((v - 1) * 2));
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const EASE: Record<Easing, (p: number) => number> = {
  inOut: (p) => p * p * (3 - 2 * p),
  in: (p) => p * p,
  out: (p) => 1 - (1 - p) * (1 - p),
};

export const positionAt = (s: { playing: boolean; startedAt: number; position: number }, now: number) => (s.playing ? (now - s.startedAt) / 1000 : s.position);

export const clock = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
};
