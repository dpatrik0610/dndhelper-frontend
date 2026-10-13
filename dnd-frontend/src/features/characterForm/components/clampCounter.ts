/** Keeps a current/max tracker sane: max never negative, current within [0, max]. */
export function clampCounter<T extends { current: number; max: number }>(counter: T): T {
  const max = Math.max(counter.max, 0);
  return { ...counter, max, current: Math.min(Math.max(counter.current, 0), max) };
}
