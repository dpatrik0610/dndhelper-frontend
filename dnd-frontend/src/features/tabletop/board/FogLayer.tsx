import { useEffect, useRef } from "react";
import type { FogOp } from "@appTypes/Tabletop";

export interface View {
  x: number;
  y: number;
  zoom: number;
}

interface FogLayerProps {
  ops: FogOp[];
  view: View;
  width: number;
  height: number;
  /** The DM sees through the fog; players get it solid. */
  translucent: boolean;
}

const FOG_COLOR = "#05060a";
/** Soft edge in world px. */
const FEATHER = 14;

/**
 * Fog of war on a canvas. Ops are painted in order onto an offscreen mask (reveal cuts holes, hide paints back),
 * then the mask is blitted once with a blur for soft edges, and a smoky noise texture is laid over the fog only.
 */
export function FogLayer({ ops, view, width, height, translucent }: FogLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const frame = requestAnimationFrame(() => {
      const dpr = window.devicePixelRatio || 1;
      const blurPx = FEATHER * view.zoom * dpr;
      const pad = Math.ceil(blurPx * 2);
      const w = Math.ceil(width * dpr);
      const h = Math.ceil(height * dpr);

      // Mask, padded so the blur doesn't fade in from the screen edges.
      const mask = (maskRef.current ??= document.createElement("canvas"));
      mask.width = w + pad * 2;
      mask.height = h + pad * 2;
      const m = mask.getContext("2d")!;
      m.globalCompositeOperation = "source-over";
      m.fillStyle = FOG_COLOR;
      m.fillRect(0, 0, mask.width, mask.height);
      m.setTransform(dpr * view.zoom, 0, 0, dpr * view.zoom, dpr * view.x + pad, dpr * view.y + pad);
      m.lineCap = "round";
      m.lineJoin = "round";
      for (const op of ops) {
        m.globalCompositeOperation = op.reveal ? "destination-out" : "source-over";
        m.fillStyle = m.strokeStyle = FOG_COLOR;
        const p = op.points;
        if (op.shape === "Rect") {
          m.fillRect(Math.min(p[0], p[2]), Math.min(p[1], p[3]), Math.abs(p[2] - p[0]), Math.abs(p[3] - p[1]));
        } else {
          m.lineWidth = op.radius * 2;
          m.beginPath();
          m.moveTo(p[0], p[1]);
          // A single point still needs a segment for the round cap to draw a dot.
          if (p.length === 2) m.lineTo(p[0] + 0.01, p[1]);
          for (let i = 2; i + 1 < p.length; i += 2) m.lineTo(p[i], p[i + 1]);
          m.stroke();
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      if ("filter" in ctx) ctx.filter = `blur(${blurPx}px)`;
      ctx.drawImage(mask, -pad, -pad);
      if ("filter" in ctx) ctx.filter = "none";

      // Smoke: texture in world space so it drifts with the map, drawn only where fog already is.
      ctx.globalCompositeOperation = "source-atop";
      ctx.globalAlpha = 0.55;
      const pattern = ctx.createPattern(smokeTexture(), "repeat");
      if (pattern) {
        ctx.setTransform(dpr * view.zoom * 2, 0, 0, dpr * view.zoom * 2, dpr * view.x, dpr * view.y);
        ctx.fillStyle = pattern;
        const s = view.zoom * 2;
        ctx.fillRect(-view.x / s, -view.y / s, width / s, height / s);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    });

    return () => cancelAnimationFrame(frame);
  }, [ops, view, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="tt-fog"
      style={{ width, height, opacity: translucent ? 0.5 : 1 }}
      aria-hidden
    />
  );
}

let smoke: HTMLCanvasElement | null = null;

/** Tileable fractal value noise as grey wisps on transparent; generated once. */
function smokeTexture(): HTMLCanvasElement {
  if (smoke) return smoke;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);

  const octaves = [
    { cells: 4, weight: 0.5 },
    { cells: 8, weight: 0.27 },
    { cells: 16, weight: 0.15 },
    { cells: 32, weight: 0.08 },
  ].map((o) => ({ ...o, lattice: Array.from({ length: o.cells * o.cells }, () => Math.random()) }));

  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (const o of octaves) {
        const fx = (x / size) * o.cells;
        const fy = (y / size) * o.cells;
        const x0 = Math.floor(fx), y0 = Math.floor(fy);
        const x1 = (x0 + 1) % o.cells, y1 = (y0 + 1) % o.cells; // wrap → seamless tile
        const sx = smooth(fx - x0), sy = smooth(fy - y0);
        const at = (cx: number, cy: number) => o.lattice[cy * o.cells + cx];
        const top = at(x0, y0) + (at(x1, y0) - at(x0, y0)) * sx;
        const bottom = at(x0, y1) + (at(x1, y1) - at(x0, y1)) * sx;
        v += (top + (bottom - top) * sy) * o.weight;
      }
      const wisp = Math.max(0, v - 0.45) / 0.55; // keep only the denser parts
      const i = (y * size + x) * 4;
      image.data[i] = 70;
      image.data[i + 1] = 76;
      image.data[i + 2] = 92;
      image.data[i + 3] = Math.round(wisp * wisp * 255);
    }
  }
  ctx.putImageData(image, 0, 0);
  smoke = canvas;
  return canvas;
}
