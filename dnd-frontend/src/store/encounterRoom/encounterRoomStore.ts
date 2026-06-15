import { create, type StoreApi, type UseBoundStore } from "zustand";
import { encounterRoomService } from "@services/encounterRoomService";
import type {
  AddEntityRequest,
  CreateRoomRequest,
  EncounterRoom,
  MapElement,
  MapSettings,
  Point2D,
  RoomToken,
  SessionEntity,
  TurnState,
} from "@appTypes/EncounterRoom";

export interface EncounterRoomState {
  room: EncounterRoom | null;
  myRooms: EncounterRoom[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  selectedEntityId: string | null;
}

export interface EncounterRoomActions {
  loadMyRooms: () => Promise<void>;
  createRoom: (request: CreateRoomRequest) => Promise<EncounterRoom | null>;
  joinRoomByCode: (joinCode: string) => Promise<EncounterRoom | null>;
  loadRoom: (roomId: string) => Promise<EncounterRoom | null>;
  deleteRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  regenerateJoinCode: (roomId: string) => Promise<string | null>;
  setRoom: (room: EncounterRoom) => void;
  setConnected: (connected: boolean) => void;
  setSelectedEntityId: (entityId: string | null) => void;
  clearRoom: () => void;
  applyTokenAdded: (token: RoomToken, revision: number) => void;
  applyTokenMoved: (tokenId: string, position: Point2D, revision: number) => void;
  applyTokenRemoved: (tokenId: string, revision: number) => void;
  applyEntityUpdated: (entityId: string, changes: Record<string, unknown>, revision: number) => void;
  applyInitiativeSet: (entityId: string, initiative: number, revision: number) => void;
  applyEntityAdded: (entity: SessionEntity, revision: number) => void;
  applyEntityRemoved: (entityId: string, revision: number) => void;
  applyMapElementAdded: (element: MapElement, revision: number) => void;
  applyMapElementRemoved: (elementId: string, revision: number) => void;
  applyMapElementsCleared: (revision: number) => void;
  applyTurnAdvanced: (turnState: TurnState, revision: number) => void;
  applyCombatStarted: (turnState: TurnState, revision: number) => void;
  applyCombatEnded: (revision: number) => void;
  applyMapSettingsUpdated: (settings: MapSettings, revision: number) => void;
  applyInventoryAdded: (inventoryId: string, revision: number) => void;
  applyInventoryRemoved: (inventoryId: string, revision: number) => void;
  applyPlayerJoined: (userId: string, revision?: number) => void;
  applyPlayerLeft: (userId: string, revision?: number) => void;
}

const setFailure = (set: (partial: Partial<EncounterRoomState>) => void, error: unknown) => {
  set({ error: error instanceof Error ? error.message : "Encounter room action failed." });
};

export const useEncounterRoomStore: UseBoundStore<StoreApi<EncounterRoomState & EncounterRoomActions>> = create((set, get) => {
  const updateRoom = (updater: (room: EncounterRoom) => EncounterRoom) => {
    const room = get().room;
    if (!room) return;
    set({ room: updater(room) });
  };

  return ({
    room: null,
    myRooms: [],
    loading: false,
    error: null,
    isConnected: false,
    selectedEntityId: null,

    loadMyRooms: async () => {
      set({ loading: true, error: null });
      try {
        const myRooms = await encounterRoomService.getMyRooms();
        set({ myRooms, loading: false });
      } catch (error) {
        setFailure(set, error);
        set({ loading: false });
      }
    },

    createRoom: async (request: CreateRoomRequest) => {
      set({ loading: true, error: null });
      try {
        const room = await encounterRoomService.createRoom(request);
        set((state) => ({ room, myRooms: [room, ...state.myRooms], loading: false }));
        return room;
      } catch (error) {
        setFailure(set, error);
        set({ loading: false });
        return null;
      }
    },

    joinRoomByCode: async (joinCode: string) => {
      set({ loading: true, error: null });
      try {
        const response = await encounterRoomService.joinRoom(joinCode);
        set({ room: response.roomState, loading: false });
        return response.roomState;
      } catch (error) {
        setFailure(set, error);
        set({ loading: false });
        return null;
      }
    },

    loadRoom: async (roomId: string) => {
      set({ loading: true, error: null });
      try {
        const room = await encounterRoomService.getRoom(roomId);
        set({ room, loading: false });
        return room;
      } catch (error) {
        setFailure(set, error);
        set({ loading: false });
        return null;
      }
    },

    deleteRoom: async (roomId: string) => {
      await encounterRoomService.deleteRoom(roomId);
      set((state) => ({
        myRooms: state.myRooms.filter((room) => room.id !== roomId),
        room: state.room?.id === roomId ? null : state.room,
      }));
    },

    leaveRoom: async (roomId: string) => {
      await encounterRoomService.leaveRoom(roomId);
      set((state) => ({
        myRooms: state.myRooms.filter((room) => room.id !== roomId),
        room: state.room?.id === roomId ? null : state.room,
      }));
    },

    regenerateJoinCode: async (roomId: string) => {
      try {
        const joinCode = await encounterRoomService.regenerateJoinCode(roomId);
        updateRoom((room) => (room.id === roomId ? { ...room, joinCode } : room));
        return joinCode;
      } catch (error) {
        setFailure(set, error);
        return null;
      }
    },

    setRoom: (room) => set({ room, error: null }),
    setConnected: (connected) => set({ isConnected: connected }),
    setSelectedEntityId: (entityId) => set({ selectedEntityId: entityId }),
    clearRoom: () => set({ room: null, selectedEntityId: null }),

    applyTokenAdded: (token, revision) =>
      updateRoom((room) => ({ ...room, revision, tokens: [...room.tokens, token] })),
    applyTokenMoved: (tokenId, position, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        tokens: room.tokens.map((token) => (token.id === tokenId ? { ...token, position } : token)),
      })),
    applyTokenRemoved: (tokenId, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        tokens: room.tokens.filter((token) => token.id !== tokenId),
      })),
    applyEntityUpdated: (entityId, changes, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        entities: room.entities.map((entity) =>
          entity.id === entityId ? { ...entity, ...changes } : entity
        ),
      })),
    applyInitiativeSet: (entityId, initiative, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        entities: room.entities.map((entity) =>
          entity.id === entityId ? { ...entity, initiative } : entity
        ),
      })),
    applyEntityAdded: (entity, revision) =>
      updateRoom((room) => ({ ...room, revision, entities: [...room.entities, entity] })),
    applyEntityRemoved: (entityId, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        entities: room.entities.filter((entity) => entity.id !== entityId),
        tokens: room.tokens.filter((token) => token.entityId !== entityId),
      })),
    applyMapElementAdded: (element, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        mapElements: [...room.mapElements, element],
      })),
    applyMapElementRemoved: (elementId, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        mapElements: room.mapElements.filter((element) => element.id !== elementId),
      })),
    applyMapElementsCleared: (revision) =>
      updateRoom((room) => ({ ...room, revision, mapElements: [] })),
    applyTurnAdvanced: (turnState, revision) => updateRoom((room) => ({ ...room, revision, turnState })),
    applyCombatStarted: (turnState, revision) => updateRoom((room) => ({ ...room, revision, turnState })),
    applyCombatEnded: (revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        turnState: { round: 0, currentIndex: 0, isActive: false },
      })),
    applyMapSettingsUpdated: (settings, revision) =>
      updateRoom((room) => ({ ...room, revision, mapSettings: settings })),
    applyInventoryAdded: (inventoryId, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        inventoryIds: room.inventoryIds.includes(inventoryId)
          ? room.inventoryIds
          : [...room.inventoryIds, inventoryId],
      })),
    applyInventoryRemoved: (inventoryId, revision) =>
      updateRoom((room) => ({
        ...room,
        revision,
        inventoryIds: room.inventoryIds.filter((id) => id !== inventoryId),
      })),
    applyPlayerJoined: (userId, revision) =>
      updateRoom((room) => ({
        ...room,
        revision: revision ?? room.revision,
        playerIds: room.playerIds.includes(userId) ? room.playerIds : [...room.playerIds, userId],
      })),
    applyPlayerLeft: (userId, revision) =>
      updateRoom((room) => ({
        ...room,
        revision: revision ?? room.revision,
        playerIds: room.playerIds.filter((id) => id !== userId),
      })),
  });
});

export const makeDefaultEntityRequest = (): AddEntityRequest => ({
  name: "",
  isPlayer: false,
  color: "#7c3aed",
  attributes: { MaxHp: 10, CurrentHp: 10, AC: 10 },
});
