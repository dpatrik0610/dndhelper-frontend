import { useToken } from "@store/auth/authSelectors";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { showNotification } from "@components/Notification/Notification";
import { useAuthStore } from "@store/auth/authStore";
import { useEncounterRoomStore } from "@store/encounterRoom/encounterRoomStore";
import type {
  EncounterRoom,
  MapElement,
  MapSettings,
  Point2D,
  RoomToken,
  SessionEntity,
  TurnState,
} from "@appTypes/EncounterRoom";

type RevisionPayload = { revision: number };

const hubBaseUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE || "https://localhost:7222/api";
  return String(apiBase).replace(/\/api\/?$/, "");
};

export function useEncounterRoomHub(roomId?: string | null) {
  const token = useToken();
  const userId = useAuthStore((state) => state.id);
  const isConnected = useEncounterRoomStore((state) => state.isConnected);
  const setConnected = useEncounterRoomStore((state) => state.setConnected);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const roomIdRef = useRef(roomId);

  roomIdRef.current = roomId;

  const canConnect = Boolean(token && userId && roomId);

  useEffect(() => {
    if (!canConnect || !userId) return;

    console.debug("[EncounterRoom] creating hub connection", { userId, roomId });

    const nextConnection = new HubConnectionBuilder()
      .withUrl(`${hubBaseUrl()}/hubs/encounter-room?userId=${encodeURIComponent(userId)}`, {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    setConnection(nextConnection);

    return () => {
      console.debug("[EncounterRoom] stopping hub connection", {
        connectionId: nextConnection.connectionId,
        state: nextConnection.state,
      });
      void nextConnection.stop();
      setConnection(null);
      setConnected(false);
    };
  }, [canConnect, setConnected, token, userId]);

  useEffect(() => {
    if (!connection) return;

    const registerHandlers = () => {
      const roomStore = useEncounterRoomStore.getState;

      connection.on("RoomStateSync", (room: EncounterRoom) => roomStore().setRoom(room));
      connection.on("TokenAdded", (payload: { token: RoomToken } & RevisionPayload) =>
        roomStore().applyTokenAdded(payload.token, payload.revision)
      );
      connection.on(
        "TokenMoved",
        (payload: { tokenId: string; position: Point2D } & RevisionPayload) =>
          roomStore().applyTokenMoved(payload.tokenId, payload.position, payload.revision)
      );
      connection.on("TokenRemoved", (payload: { tokenId: string } & RevisionPayload) =>
        roomStore().applyTokenRemoved(payload.tokenId, payload.revision)
      );
      connection.on("EntityAdded", (payload: { entity: SessionEntity } & RevisionPayload) =>
        roomStore().applyEntityAdded(payload.entity, payload.revision)
      );
      connection.on(
        "EntityUpdated",
        (payload: { entityId: string; changes: Record<string, unknown> } & RevisionPayload) =>
          roomStore().applyEntityUpdated(payload.entityId, payload.changes, payload.revision)
      );
      connection.on("EntityRemoved", (payload: { entityId: string } & RevisionPayload) =>
        roomStore().applyEntityRemoved(payload.entityId, payload.revision)
      );
      connection.on("InitiativeSet", (payload: { entityId: string; initiative: number } & RevisionPayload) =>
        roomStore().applyInitiativeSet(payload.entityId, payload.initiative, payload.revision)
      );
      connection.on("MapElementAdded", (payload: { element: MapElement } & RevisionPayload) =>
        roomStore().applyMapElementAdded(payload.element, payload.revision)
      );
      connection.on("MapElementRemoved", (payload: { elementId: string } & RevisionPayload) =>
        roomStore().applyMapElementRemoved(payload.elementId, payload.revision)
      );
      connection.on("MapElementsCleared", (payload: RevisionPayload) =>
        roomStore().applyMapElementsCleared(payload.revision)
      );
      connection.on("TurnAdvanced", (payload: { turnState: TurnState } & RevisionPayload) =>
        roomStore().applyTurnAdvanced(payload.turnState, payload.revision)
      );
      connection.on("CombatStarted", (payload: { turnState: TurnState } & RevisionPayload) =>
        roomStore().applyCombatStarted(payload.turnState, payload.revision)
      );
      connection.on("CombatEnded", (payload: RevisionPayload) => roomStore().applyCombatEnded(payload.revision));
      connection.on("MapSettingsUpdated", (payload: { settings: MapSettings } & RevisionPayload) =>
        roomStore().applyMapSettingsUpdated(payload.settings, payload.revision)
      );
      connection.on("InventoryAdded", (payload: { inventoryId: string } & RevisionPayload) =>
        roomStore().applyInventoryAdded(payload.inventoryId, payload.revision)
      );
      connection.on("InventoryRemoved", (payload: { inventoryId: string } & RevisionPayload) =>
        roomStore().applyInventoryRemoved(payload.inventoryId, payload.revision)
      );
      connection.on("PlayerJoined", (payload: { userId: string; revision?: number }) =>
        roomStore().applyPlayerJoined(payload.userId, payload.revision)
      );
      connection.on("PlayerLeft", (payload: { userId: string; revision?: number }) =>
        roomStore().applyPlayerLeft(payload.userId, payload.revision)
      );
      connection.on("RoomEnded", () => {
        roomStore().clearRoom();
        showNotification({ title: "Encounter room ended", message: "The room was closed by the DM.", color: "yellow" });
      });
    };

    const start = async () => {
      try {
        registerHandlers();
        if (connection.state !== HubConnectionState.Disconnected) return;
        console.debug("[EncounterRoom] starting hub connection", { roomId: roomIdRef.current });
        await connection.start();
        console.debug("[EncounterRoom] hub connected", {
          connectionId: connection.connectionId,
          roomId: roomIdRef.current,
        });
        setConnected(true);
        if (roomIdRef.current) {
          console.debug("[EncounterRoom] invoking ReJoinRoom", { roomId: roomIdRef.current });
          await connection.invoke("ReJoinRoom", roomIdRef.current);
        }
      } catch (error) {
        console.error("[EncounterRoom] hub connection error", error);
        setConnected(false);
        showNotification({
          title: "Encounter room connection failed",
          message: error instanceof Error ? error.message : "Could not connect to the room hub.",
          color: "red",
        });
      }
    };

    connection.onreconnecting((error) => {
      console.warn("[EncounterRoom] hub reconnecting", error);
      setConnected(false);
    });
    connection.onreconnected(async () => {
      console.debug("[EncounterRoom] hub reconnected", {
        connectionId: connection.connectionId,
        roomId: roomIdRef.current,
      });
      setConnected(true);
      if (roomIdRef.current) await connection.invoke("ReJoinRoom", roomIdRef.current);
    });
    connection.onclose((error) => {
      console.warn("[EncounterRoom] hub closed", error);
      setConnected(false);
    });

    void start();

    return () => {
      connection.off("RoomStateSync");
      connection.off("TokenAdded");
      connection.off("TokenMoved");
      connection.off("TokenRemoved");
      connection.off("EntityAdded");
      connection.off("EntityUpdated");
      connection.off("EntityRemoved");
      connection.off("InitiativeSet");
      connection.off("MapElementAdded");
      connection.off("MapElementRemoved");
      connection.off("MapElementsCleared");
      connection.off("TurnAdvanced");
      connection.off("CombatStarted");
      connection.off("CombatEnded");
      connection.off("MapSettingsUpdated");
      connection.off("InventoryAdded");
      connection.off("InventoryRemoved");
      connection.off("PlayerJoined");
      connection.off("PlayerLeft");
      connection.off("RoomEnded");
    };
  }, [connection, setConnected]);

  const invoke = useMemo(
    () => async <T,>(methodName: string, payload: T) => {
      if (!connection || connection.state !== HubConnectionState.Connected) {
        throw new Error("Encounter room hub is not connected.");
      }
      return connection.invoke(methodName, payload);
    },
    [connection]
  );

  return { connection, invoke, isConnected };
}
