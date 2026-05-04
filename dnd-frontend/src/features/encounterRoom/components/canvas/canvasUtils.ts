import type { Point2D } from "@appTypes/EncounterRoom";
import type { PointerEvent } from "react";

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export const clampZoom = (zoom: number, min = 0.05, max = 32) => Math.min(max, Math.max(min, zoom));

export const screenToWorld = (screenPos: Point2D, camera: Camera): Point2D => ({
  x: (screenPos.x - camera.x) / camera.zoom,
  y: (screenPos.y - camera.y) / camera.zoom,
});

export const worldToScreen = (worldPos: Point2D, camera: Camera): Point2D => ({
  x: worldPos.x * camera.zoom + camera.x,
  y: worldPos.y * camera.zoom + camera.y,
});

export const getCanvasPoint = (event: PointerEvent<HTMLCanvasElement>): Point2D => {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

export const distance = (a: Point2D, b: Point2D) => Math.hypot(a.x - b.x, a.y - b.y);
