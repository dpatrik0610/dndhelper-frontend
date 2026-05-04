import type { Camera } from "./canvasUtils";
import { distance } from "./canvasUtils";
import type { EncounterRoom, Point2D, RoomToken } from "@appTypes/EncounterRoom";

export interface DrawableToken {
  token: RoomToken;
  center: Point2D;
  radius: number;
}

export function getDrawableTokens(room: EncounterRoom, isDM: boolean): DrawableToken[] {
  return room.tokens
    .filter((token) => isDM || !token.hidden)
    .map((token) => ({
      token,
      center: token.position,
      radius: (room.mapSettings.gridCellSize * token.size) / 2,
    }));
}

export function hitTestToken(tokens: DrawableToken[], worldPoint: Point2D) {
  return [...tokens].reverse().find((drawable) => distance(drawable.center, worldPoint) <= drawable.radius);
}

export function drawTokens(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  room: EncounterRoom,
  isDM: boolean,
  draggingToken?: { tokenId: string; position: Point2D } | null
) {
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  getDrawableTokens(room, isDM).forEach(({ token, radius }) => {
    const entity = room.entities.find((item) => item.id === token.entityId);
    const position = draggingToken?.tokenId === token.id ? draggingToken.position : token.position;
    const color = entity?.color || "#7c3aed";
    const label = entity?.name?.trim().charAt(0).toUpperCase() || "?";

    ctx.save();
    ctx.globalAlpha = token.hidden ? 0.45 : 1;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius - 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 3 / camera.zoom;
    ctx.strokeStyle = "#f8fafc";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.max(14, radius * 0.65)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, position.x, position.y);
    ctx.restore();
  });

  ctx.restore();
}
