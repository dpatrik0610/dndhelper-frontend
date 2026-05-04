import type { Camera } from "./canvasUtils";
import { gridDistanceInCells } from "../../utils/gridMath";
import type { MapSettings, Point2D } from "@appTypes/EncounterRoom";

export function drawMeasureOverlay(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  settings: MapSettings,
  measure: { start: Point2D; end: Point2D } | null
) {
  if (!measure) return;

  const start = { x: measure.start.x * camera.zoom + camera.x, y: measure.start.y * camera.zoom + camera.y };
  const end = { x: measure.end.x * camera.zoom + camera.x, y: measure.end.y * camera.zoom + camera.y };
  const cells = gridDistanceInCells(measure.start, measure.end, settings);
  const label = `${cells.toFixed(1)} cells / ${(cells * 5).toFixed(0)} ft`;

  ctx.save();
  ctx.strokeStyle = "#facc15";
  ctx.fillStyle = "#facc15";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.font = "600 13px system-ui";
  ctx.fillText(label, (start.x + end.x) / 2 + 8, (start.y + end.y) / 2 - 8);
  ctx.restore();
}
