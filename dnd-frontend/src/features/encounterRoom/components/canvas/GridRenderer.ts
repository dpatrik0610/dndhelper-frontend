import type { Camera } from "./canvasUtils";
import type { MapSettings, Point2D } from "@appTypes/EncounterRoom";
import { getHexCellCenter, mapPixelSize } from "../../utils/gridMath";

interface RenderBounds {
  width: number;
  height: number;
}

const withWorldTransform = (ctx: CanvasRenderingContext2D, camera: Camera, draw: () => void) => {
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);
  draw();
  ctx.restore();
};

export function renderSquareGrid(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  settings: MapSettings,
  bounds: RenderBounds = mapPixelSize(settings)
) {
  withWorldTransform(ctx, camera, () => {
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1 / camera.zoom;
    ctx.beginPath();

    for (let x = 0; x <= bounds.width; x += settings.gridCellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, bounds.height);
    }

    for (let y = 0; y <= bounds.height; y += settings.gridCellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(bounds.width, y);
    }

    ctx.stroke();
  });
}

const hexCorners = (center: Point2D, radius: number) =>
  Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30);
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });

export function renderHexGrid(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  settings: MapSettings,
  bounds: RenderBounds = mapPixelSize(settings)
) {
  withWorldTransform(ctx, camera, () => {
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1 / camera.zoom;
    const radius = settings.gridCellSize / 2;
    const hexWidth = Math.sqrt(3) * radius;
    const rowHeight = 1.5 * radius;
    const rows = Math.ceil(bounds.height / rowHeight) + 2;
    const cols = Math.ceil(bounds.width / hexWidth) + 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const corners = hexCorners(getHexCellCenter(col, row, settings.gridCellSize), settings.gridCellSize / 2);
        ctx.beginPath();
        corners.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.stroke();
      }
    }
  });
}

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  settings: MapSettings,
  bounds: RenderBounds = mapPixelSize(settings)
) {
  if (settings.gridType === "Hex") renderHexGrid(ctx, camera, settings, bounds);
  else renderSquareGrid(ctx, camera, settings, bounds);
}
