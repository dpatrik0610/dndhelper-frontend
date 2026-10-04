/**
 * mulberry32: tiny deterministic PRNG. Same seed → same sequence, so procedurally generated
 * theme scenes (skylines, mountains, stars) look identical on every load.
 * Returns a function yielding floats in [0, 1).
 */
export function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
