import { useCallback } from "react";
import { showNotification } from "@components/Notification/Notification";
import { useEncounterRoomStore } from "@store/encounterRoom/encounterRoomStore";
import type {
  AddEntityRequest,
  AddInventoryRequest,
  AddMapElementRequest,
  AddTokenRequest,
  MoveTokenRequest,
  RemoveEntityRequest,
  RemoveInventoryRequest,
  RemoveMapElementRequest,
  RemoveTokenRequest,
  RoomActionEnvelope,
  SetInitiativeRequest,
  UpdateEntityRequest,
  UpdateMapSettingsRequest,
} from "@appTypes/EncounterRoom";

type Invoke = <T>(methodName: string, payload: T) => Promise<unknown>;

const notifyFailure = (error: unknown) => {
  console.error("[EncounterRoom] Hub action failed", error);
  showNotification({
    title: "Encounter action failed",
    message: error instanceof Error ? error.message : "The room state may be out of date.",
    color: "red",
  });
};

export function useRoomActions(invoke: Invoke) {
  const room = useEncounterRoomStore((state) => state.room);

  const send = useCallback(
    async <T,>(methodName: string, action: T) => {
      if (!room) return;
      const envelope: RoomActionEnvelope<T> = {
        roomId: room.id,
        expectedRevision: room.revision,
        action,
      };

      try {
        console.debug("[EncounterRoom] invoking hub action", {
          methodName,
          roomId: envelope.roomId,
          expectedRevision: envelope.expectedRevision,
          action: envelope.action,
        });
        await invoke(methodName, envelope);
        console.debug("[EncounterRoom] hub action completed", {
          methodName,
          roomId: envelope.roomId,
        });
      } catch (error) {
        console.error("[EncounterRoom] hub action error", {
          methodName,
          roomId: envelope.roomId,
          expectedRevision: envelope.expectedRevision,
          action: envelope.action,
          error,
        });
        notifyFailure(error);
      }
    },
    [invoke, room]
  );

  return {
    addEntity: (request: AddEntityRequest) => send("AddEntity", request),
    updateEntity: (request: UpdateEntityRequest) => send("UpdateEntity", request),
    removeEntity: (request: RemoveEntityRequest) => send("RemoveEntity", request),
    addToken: (request: AddTokenRequest) => send("AddToken", request),
    moveToken: (request: MoveTokenRequest) => send("MoveToken", request),
    removeToken: (request: RemoveTokenRequest) => send("RemoveToken", request),
    addMapElement: (request: AddMapElementRequest) => send("AddMapElement", request),
    removeMapElement: (request: RemoveMapElementRequest) => send("RemoveMapElement", request),
    clearMapElements: () => send("ClearMapElements", {}),
    setInitiative: (request: SetInitiativeRequest) => send("SetInitiative", request),
    advanceTurn: () => send("AdvanceTurn", {}),
    startCombat: () => send("StartCombat", {}),
    endCombat: () => send("EndCombat", {}),
    updateMapSettings: (request: UpdateMapSettingsRequest) => send("UpdateMapSettings", request),
    addInventory: (request: AddInventoryRequest) => send("AddInventory", request),
    removeInventory: (request: RemoveInventoryRequest) => send("RemoveInventory", request),
  };
}
