import type { MapSettings, Point2D } from "@appTypes/EncounterRoom";

export const mapPixelSize = (settings: MapSettings) => ({
  width: settings.gridWidth * settings.gridCellSize,
  height: settings.gridHeight * settings.gridCellSize,
});

export const getSquareCellCenter = (col: number, row: number, cellSize: number): Point2D => ({
  x: col * cellSize + cellSize / 2,
  y: row * cellSize + cellSize / 2,
});

export const snapToSquareGrid = (point: Point2D, cellSize: number): Point2D => {
  const col = Math.max(0, Math.floor(point.x / cellSize));
  const row = Math.max(0, Math.floor(point.y / cellSize));
  return getSquareCellCenter(col, row, cellSize);
};

export const getHexCellCenter = (col: number, row: number, cellSize: number): Point2D => {
  const radius = cellSize / 2;
  const width = Math.sqrt(3) * radius;
  const vertical = 1.5 * radius;

  return {
    x: col * width + (row % 2 ? width / 2 : 0) + width / 2,
    y: row * vertical + radius,
  };
};

export const snapToHexGrid = (point: Point2D, settings: MapSettings): Point2D => {
  let best = getHexCellCenter(0, 0, settings.gridCellSize);
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let row = 0; row < settings.gridHeight; row++) {
    for (let col = 0; col < settings.gridWidth; col++) {
      const center = getHexCellCenter(col, row, settings.gridCellSize);
      const distance = Math.hypot(center.x - point.x, center.y - point.y);
      if (distance < bestDistance) {
        best = center;
        bestDistance = distance;
      }
    }
  }

  return best;
};

export const snapToGrid = (point: Point2D, settings: MapSettings) =>
  settings.gridType === "Hex"
    ? snapToHexGrid(point, settings)
    : snapToSquareGrid(point, settings.gridCellSize);

export const gridDistanceInCells = (a: Point2D, b: Point2D, settings: MapSettings) =>
  Math.hypot(a.x - b.x, a.y - b.y) / settings.gridCellSize;
