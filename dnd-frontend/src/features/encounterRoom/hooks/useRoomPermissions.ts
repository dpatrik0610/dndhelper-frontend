import { useMemo } from "react";
import { useAuthStore } from "@store/useAuthStore";
import type { EncounterRoom, RoomToken, SessionEntity } from "@appTypes/EncounterRoom";

export function useRoomPermissions(room: EncounterRoom | null) {
  const userId = useAuthStore((state) => state.id);

  return useMemo(() => {
    const isDM = Boolean(room && userId && room.dungeonMasterId === userId);
    const ownsEntity = (entity?: SessionEntity | null) => Boolean(entity && userId && entity.ownerId === userId);
    const entityByToken = (token: RoomToken) => room?.entities.find((entity) => entity.id === token.entityId);

    return {
      userId,
      isDM,
      isMember: Boolean(room && userId && (isDM || room.playerIds.includes(userId))),
      canEditEntity: (entity?: SessionEntity | null) => isDM || ownsEntity(entity),
      canMoveToken: (token: RoomToken) => isDM || ownsEntity(entityByToken(token)),
      canManageRoom: isDM,
    };
  }, [room, userId]);
}
