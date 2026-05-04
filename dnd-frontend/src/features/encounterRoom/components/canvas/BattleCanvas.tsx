import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Box } from "@mantine/core";
import type { AddMapElementRequest, Point2D, ShapeType } from "@appTypes/EncounterRoom";
import { useEncounterRoomStore } from "@store/useEncounterRoomStore";
import { renderGrid } from "./GridRenderer";
import { drawMapElements } from "./DrawingLayer";
import { drawMeasureOverlay } from "./MeasureOverlay";
import { drawTokens, getDrawableTokens, hitTestToken } from "./TokenLayer";
import { getCanvasPoint, screenToWorld } from "./canvasUtils";
import { mapPixelSize, snapToGrid } from "../../utils/gridMath";
import { useCanvasInteraction } from "../../hooks/useCanvasInteraction";
import { useRoomPermissions } from "../../hooks/useRoomPermissions";

export type EncounterTool = "select" | "pan" | "draw" | "shape" | "measure" | "eraser";

interface BattleCanvasProps {
  activeTool: EncounterTool;
  shapeType: ShapeType;
  color: string;
  thickness: number;
  onMoveToken: (tokenId: string, position: Point2D) => void;
  onAddMapElement: (request: AddMapElementRequest) => void;
  onRemoveMapElement: (elementId: string) => void;
}

type PointerMode =
  | { type: "idle" }
  | { type: "panning"; screen: Point2D }
  | { type: "draggingToken"; tokenId: string; position: Point2D }
  | { type: "drawing"; points: Point2D[] }
  | { type: "measuring"; start: Point2D; end: Point2D };

const getRenderSize = (
  room: NonNullable<ReturnType<typeof useEncounterRoomStore.getState>["room"]>,
  mapImage: HTMLImageElement | null
) => {
  const gridSize = mapPixelSize(room.mapSettings);
  if (!mapImage?.naturalWidth || !mapImage.naturalHeight) return gridSize;

  const imageRatio = mapImage.naturalWidth / mapImage.naturalHeight;
  const gridRatio = gridSize.width / gridSize.height;

  if (!Number.isFinite(gridRatio) || gridRatio <= 0) {
    return { width: mapImage.naturalWidth, height: mapImage.naturalHeight };
  }

  if (Math.abs(imageRatio - gridRatio) < 0.05) return gridSize;

  return {
    width: gridSize.width,
    height: gridSize.width / imageRatio,
  };
};

export function BattleCanvas({
  activeTool,
  shapeType,
  color,
  thickness,
  onMoveToken,
  onAddMapElement,
  onRemoveMapElement,
}: BattleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const room = useEncounterRoomStore((state) => state.room);
  const setSelectedEntityId = useEncounterRoomStore((state) => state.setSelectedEntityId);
  const permissions = useRoomPermissions(room);
  const settings = room?.mapSettings;
  const { camera, panBy, zoomBy, fitToViewport } = useCanvasInteraction(settings ?? {
    mapImageUrl: null,
    gridType: "Square",
    gridCellSize: 50,
    gridWidth: 20,
    gridHeight: 20,
  });
  const [mode, setMode] = useState<PointerMode>({ type: "idle" });
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);

  const drawableTokens = useMemo(
    () => (room ? getDrawableTokens(room, permissions.isDM) : []),
    [permissions.isDM, room]
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !settings) return;
    const observer = new ResizeObserver(([entry]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = entry.contentRect;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      fitToViewport(width, height, room && mapImage ? getRenderSize(room, mapImage) : undefined);
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [fitToViewport, mapImage, room, settings]);

  useEffect(() => {
    if (!room?.mapSettings.mapImageUrl) {
      setMapImage(null);
      return;
    }

    let active = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (active) setMapImage(image);
    };
    image.onerror = () => {
      if (active) setMapImage(null);
    };
    image.src = room.mapSettings.mapImageUrl;

    return () => {
      active = false;
    };
  }, [room?.mapSettings.mapImageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !room) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    const mapSize = getRenderSize(room, mapImage);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.fillStyle = "#182235";
    ctx.fillRect(0, 0, mapSize.width, mapSize.height);
    if (mapImage) {
      ctx.drawImage(mapImage, 0, 0, mapSize.width, mapSize.height);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.strokeRect(0, 0, mapSize.width, mapSize.height);
    ctx.restore();

    renderGrid(ctx, camera, room.mapSettings, mapSize);

    const drawingPreview =
      mode.type === "drawing"
        ? { points: mode.points, color, thickness, shape: activeTool === "shape" ? shapeType : null }
        : undefined;
    drawMapElements(ctx, camera, room.mapElements, drawingPreview);
    drawTokens(
      ctx,
      camera,
      room,
      permissions.isDM,
      mode.type === "draggingToken" ? { tokenId: mode.tokenId, position: mode.position } : null
    );
    drawMeasureOverlay(
      ctx,
      camera,
      room.mapSettings,
      mode.type === "measuring" ? { start: mode.start, end: mode.end } : null
    );
  }, [activeTool, camera, color, mapImage, mode, permissions.isDM, room, shapeType, thickness]);

  if (!room || !settings) return null;

  const worldFromEvent = (event: PointerEvent<HTMLCanvasElement>) =>
    screenToWorld(getCanvasPoint(event), camera);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const screen = getCanvasPoint(event);
    const world = worldFromEvent(event);

    if (activeTool === "pan" || event.button === 1) {
      setMode({ type: "panning", screen });
      return;
    }

    if (activeTool === "measure") {
      setMode({ type: "measuring", start: world, end: world });
      return;
    }

    if (activeTool === "draw" || activeTool === "shape") {
      setMode({ type: "drawing", points: [world, world] });
      return;
    }

    if (activeTool === "eraser") {
      const target = [...room.mapElements].reverse().find((element) =>
        element.points.some((point) => Math.hypot(point.x - world.x, point.y - world.y) <= settings.gridCellSize / 3)
      );
      if (target) onRemoveMapElement(target.id);
      return;
    }

    const tokenHit = hitTestToken(drawableTokens, world);
    if (tokenHit) {
      const entity = room.entities.find((item) => item.id === tokenHit.token.entityId);
      setSelectedEntityId(entity?.id ?? null);
      if (permissions.canMoveToken(tokenHit.token)) {
        setMode({ type: "draggingToken", tokenId: tokenHit.token.id, position: tokenHit.token.position });
      }
    } else {
      setSelectedEntityId(null);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const screen = getCanvasPoint(event);
    const world = worldFromEvent(event);

    if (mode.type === "panning") {
      panBy(screen.x - mode.screen.x, screen.y - mode.screen.y);
      setMode({ type: "panning", screen });
    } else if (mode.type === "draggingToken") {
      setMode({ ...mode, position: snapToGrid(world, settings) });
    } else if (mode.type === "drawing") {
      setMode({
        type: "drawing",
        points: activeTool === "shape" ? [mode.points[0], world] : [...mode.points, world],
      });
    } else if (mode.type === "measuring") {
      setMode({ ...mode, end: world });
    }
  };

  const handlePointerUp = () => {
    if (mode.type === "draggingToken") {
      onMoveToken(mode.tokenId, mode.position);
    } else if (mode.type === "drawing" && mode.points.length > 1) {
      onAddMapElement({
        type: activeTool === "shape" ? "Shape" : "Drawing",
        shape: activeTool === "shape" ? shapeType : null,
        points: mode.points,
        color,
        thickness,
      });
    }
    setMode({ type: "idle" });
  };

  return (
    <Box ref={wrapperRef} style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={(event) => {
          event.preventDefault();
          zoomBy(event.deltaY > 0 ? -0.1 : 0.1);
        }}
        style={{
          display: "block",
          cursor: activeTool === "pan" ? "grab" : activeTool === "eraser" ? "crosshair" : "default",
          touchAction: "none",
        }}
      />
    </Box>
  );
}
