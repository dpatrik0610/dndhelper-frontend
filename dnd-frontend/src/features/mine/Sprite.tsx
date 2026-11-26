import { useEffect, useRef } from "react";
import type { Grid } from "./art/pixel";
import { toCanvas } from "./render";

export function Sprite({
  grid,
  scale = 3,
  label,
  className,
}: {
  grid: Grid;
  scale?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const w = grid[0]?.length ?? 1;
  const h = grid.length;

  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(toCanvas(grid), 0, 0);
  }, [grid, w, h]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className={className}
      style={{ width: w * scale, height: h * scale, imageRendering: "pixelated" }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
