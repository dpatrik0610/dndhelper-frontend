import type { Camera } from "./canvasUtils";
import type { MapElement, Point2D } from "@appTypes/EncounterRoom";

export function drawMapElements(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  elements: MapElement[],
  preview?: { points: Point2D[]; color: string; thickness: number; shape?: string | null }
) {
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  [...elements.filter((element) => element.isVisible), preview].filter(Boolean).forEach((element) => {
    const points = element!.points;
    if (points.length < 2) return;

    ctx.strokeStyle = element!.color;
    ctx.fillStyle = element!.color;
    ctx.lineWidth = element!.thickness / camera.zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    const shape = "shape" in element! ? element!.shape : null;
    const [start, end] = points;

    if (shape === "Circle") {
      const radius = Math.hypot(end.x - start.x, end.y - start.y);
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
    } else if (shape === "Rectangle" || shape === "Square" || shape === "Cube") {
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else {
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    }

    ctx.stroke();
  });

  ctx.restore();
}
