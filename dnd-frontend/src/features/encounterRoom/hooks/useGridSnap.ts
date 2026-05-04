import { useCallback } from "react";
import type { MapSettings, Point2D } from "@appTypes/EncounterRoom";
import { snapToGrid } from "../utils/gridMath";

export function useGridSnap(settings: MapSettings) {
  return useCallback((point: Point2D) => snapToGrid(point, settings), [settings]);
}
