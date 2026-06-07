import { useEncounterRoomStore } from "./encounterRoomStore";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useShallow } from "zustand/react/shallow";

// Data Selectors
export const useRoom = () => useEncounterRoomStore((s) => s.room);
export const useMyRooms = () => useEncounterRoomStore((s) => s.myRooms);
export const useRoomLoading = () => useEncounterRoomStore((s) => s.loading);
export const useRoomError = () => useEncounterRoomStore((s) => s.error);
export const useRoomIsConnected = () => useEncounterRoomStore((s) => s.isConnected);
export const useSelectedEntityId = () => useEncounterRoomStore((s) => s.selectedEntityId);

// Derived Selectors
export const useIsDM = () => {
  const room = useRoom();
  const userId = useCurrentUserId();
  return Boolean(room && userId && room.dungeonMasterId === userId);
};

export const useMyEntities = () => {
  const room = useRoom();
  const userId = useCurrentUserId();
  if (!room || !userId) return [];
  return room.entities.filter((entity) => entity.ownerId === userId);
};

// Action Selectors
export const useEncounterRoomActions = () => useEncounterRoomStore(useShallow((s) => ({
  loadMyRooms: s.loadMyRooms,
  createRoom: s.createRoom,
  joinRoomByCode: s.joinRoomByCode,
  loadRoom: s.loadRoom,
  deleteRoom: s.deleteRoom,
  leaveRoom: s.leaveRoom,
  regenerateJoinCode: s.regenerateJoinCode,
  setRoom: s.setRoom,
  setConnected: s.setConnected,
  setSelectedEntityId: s.setSelectedEntityId,
  clearRoom: s.clearRoom,
  applyTokenAdded: s.applyTokenAdded,
  applyTokenMoved: s.applyTokenMoved,
  applyTokenRemoved: s.applyTokenRemoved,
  applyEntityUpdated: s.applyEntityUpdated,
  applyInitiativeSet: s.applyInitiativeSet,
  applyEntityAdded: s.applyEntityAdded,
  applyEntityRemoved: s.applyEntityRemoved,
  applyMapElementAdded: s.applyMapElementAdded,
  applyMapElementRemoved: s.applyMapElementRemoved,
  applyMapElementsCleared: s.applyMapElementsCleared,
  applyTurnAdvanced: s.applyTurnAdvanced,
  applyCombatStarted: s.applyCombatStarted,
  applyCombatEnded: s.applyCombatEnded,
  applyMapSettingsUpdated: s.applyMapSettingsUpdated,
  applyInventoryAdded: s.applyInventoryAdded,
  applyInventoryRemoved: s.applyInventoryRemoved,
  applyPlayerJoined: s.applyPlayerJoined,
  applyPlayerLeft: s.applyPlayerLeft,
})));
