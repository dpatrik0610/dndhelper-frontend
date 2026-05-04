import { useCallback, useMemo, useState } from "react";
import type { Camera } from "../components/canvas/canvasUtils";
import { clampZoom } from "../components/canvas/canvasUtils";
import { mapPixelSize } from "../utils/gridMath";
import type { MapSettings } from "@appTypes/EncounterRoom";

interface ViewportSize {
  width: number;
  height: number;
}

export function useCanvasInteraction(settings: MapSettings) {
  const [camera, setCamera] = useState<Camera>({ x: 40, y: 40, zoom: 1 });

  const zoomBy = useCallback((delta: number) => {
    setCamera((current) => ({ ...current, zoom: clampZoom(current.zoom + delta) }));
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setCamera((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
  }, []);

  const fitToViewport = useCallback(
    (width: number, height: number, preferredSize?: ViewportSize) => {
      const size = preferredSize ?? mapPixelSize(settings);
      if (width <= 0 || height <= 0 || size.width <= 0 || size.height <= 0) return;

      const zoom = clampZoom(Math.max(width / size.width, height / size.height), 0.05, 32);
      setCamera({
        zoom,
        x: (width - size.width * zoom) / 2,
        y: (height - size.height * zoom) / 2,
      });
    },
    [settings]
  );

  return useMemo(() => ({ camera, setCamera, zoomBy, panBy, fitToViewport }), [camera, fitToViewport, panBy, zoomBy]);
}
