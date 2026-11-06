export interface Point {
  x: number;
  y: number;
}

/**
 * Deterministic Fruchterman-Reingold layout in a width x height box.
 * ponytail: O(n²) per iteration, fine for a few hundred notes; switch to d3-force if campaigns grow past that.
 */
export function layoutGraph(
  ids: string[],
  edges: [string, string][],
  width = 800,
  height = 600,
  iterations = 250,
): Map<string, Point> {
  const n = ids.length;
  const mx = Math.min(90, width * 0.2);
  const cx = width / 2;
  const cy = height / 2;
  if (n === 0) return new Map();
  if (n === 1) return new Map([[ids[0], { x: cx, y: cy }]]);

  const pos = new Map<string, Point>();
  const radius = Math.min(width, height) * 0.35;
  ids.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / n;
    pos.set(id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  const k = Math.sqrt((width * height) / n) * 0.6;
  const links = edges.filter(([a, b]) => a !== b && pos.has(a) && pos.has(b));
  let temperature = width / 10;

  for (let it = 0; it < iterations; it++) {
    const disp = new Map(ids.map((id) => [id, { x: 0, y: 0 }]));

    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const p = pos.get(ids[i])!;
        const q = pos.get(ids[j])!;
        let dx = p.x - q.x;
        let dy = p.y - q.y;
        if (dx === 0 && dy === 0) {
          dx = 0.01 * (i + 1);
          dy = 0.01 * (j + 1);
        }
        const d = Math.hypot(dx, dy);
        const force = (k * k) / d;
        const di = disp.get(ids[i])!;
        const dj = disp.get(ids[j])!;
        di.x += (dx / d) * force;
        di.y += (dy / d) * force;
        dj.x -= (dx / d) * force;
        dj.y -= (dy / d) * force;
      }

    for (const [a, b] of links) {
      const p = pos.get(a)!;
      const q = pos.get(b)!;
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d = Math.max(Math.hypot(dx, dy), 0.01);
      const force = (d * d) / k;
      const da = disp.get(a)!;
      const db = disp.get(b)!;
      da.x -= (dx / d) * force;
      da.y -= (dy / d) * force;
      db.x += (dx / d) * force;
      db.y += (dy / d) * force;
    }

    for (const id of ids) {
      const p = pos.get(id)!;
      const v = disp.get(id)!;
      v.x += (cx - p.x) * 0.05;
      v.y += (cy - p.y) * 0.05;
      const len = Math.max(Math.hypot(v.x, v.y), 0.01);
      const step = Math.min(len, temperature);
      p.x = Math.min(width - mx, Math.max(mx, p.x + (v.x / len) * step));
      p.y = Math.min(height - 36, Math.max(24, p.y + (v.y / len) * step));
    }
    temperature *= 0.98;
  }

  return pos;
}
