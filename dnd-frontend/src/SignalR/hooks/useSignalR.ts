import { useEffect, useState, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { showNotification } from "@components/Notification/Notification";
import { useToken, useCurrentUserId, useIsAdmin } from "@store/auth/authSelectors";
import { useSubtleRollStore } from "@store/ui/subtleRollStore";
import { EntitySyncManager } from "@signalr/SyncManager/entitySyncManager";
import type { EntityChangeEvent } from "@signalr/SyncManager/handlers/entitySyncTypes";
import type { SubtleRollEvent } from "@appTypes/Roll";

interface SignalRMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

export const useSignalR = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  const token = useToken();
  const userId = useCurrentUserId();
  const isAdmin = useIsAdmin();
  const openSubtleRoll = useSubtleRollStore((state) => state.openRoll);

  // Keep latest values in refs to avoid recreating the connection/listeners when they change
  const isAdminRef = useRef(isAdmin);
  const openSubtleRollRef = useRef(openSubtleRoll);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  useEffect(() => {
    openSubtleRollRef.current = openSubtleRoll;
  }, [openSubtleRoll]);

  useEffect(() => {
    if (!token || !userId) {
      console.debug("Not authenticated, skipping SignalR connection");
      setIsConnected(false);
      setConnection(null);
      connectionRef.current = null;
      return;
    }

    const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:7222";
    const baseUrl = API_BASE.replace(/\/api$/, "");

    console.debug(`🔌 Creating SignalR connection for userId: ${userId}`);

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notifications?userId=${userId}`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = newConnection;
    setConnection(newConnection);

    // Register event handlers BEFORE starting connection so we don't miss early messages
    newConnection.on("ReceiveNotification", (message: SignalRMessage) => {
      // console.log("📩 Received notification:", message);

      showNotification({
        title: `Message from ${message.sender}`,
        message: message.content,
        color: "blue",
        autoClose: 5000,
      });
    });

    newConnection.on("EntityChanged", (event: EntityChangeEvent) => {
      // console.log("🧩 EntityChanged received:", event);
      EntitySyncManager.handleEntityChange(event);
    });

    newConnection.on(
      "EntityBatchChanged",
      (batch: {
        correlationId: string;
        timestamp: string;
        changes: EntityChangeEvent[];
      }) => {
        // console.log("📦 EntityBatchChanged received:", batch);
        batch.changes.forEach((event) => {
          EntitySyncManager.handleEntityChange(event);
        });
      }
    );

    newConnection.on("SubtleRoll", (payload: SubtleRollEvent) => {
      if (!isAdminRef.current) return;

      // console.log("SubtleRoll received:", payload);

      showNotification({
        title: `Subtle roll from ${payload.characterName}`,
        message: "Click to view details",
        color: "violet",
        autoClose: false,
        onClick: () => openSubtleRollRef.current(payload),
      });
    });

    // Connection state listeners
    newConnection.onreconnecting((error) => {
      console.debug("🔄 SignalR Reconnecting...", error);
      setIsConnected(false);
    });

    newConnection.onreconnected((connectionId) => {
      console.debug("SignalR Reconnected!", connectionId);
      setIsConnected(true);

      showNotification({
        message: "Reconnected to server",
        color: "green",
        autoClose: 2000,
      });
    });

    newConnection.onclose((error) => {
      console.debug("🔴 SignalR Connection closed", error);
      setIsConnected(false);
    });

    const startConnection = async () => {
      if (newConnection.state === "Disconnected") {
        try {
          await newConnection.start();
          console.debug("SignalR Connected!");
          setIsConnected(true);
        } catch (err) {
          console.error("SignalR Connection Error:", err);
          setIsConnected(false);
        }
      } else if (newConnection.state === "Connected") {
        setIsConnected(true);
      }
    };

    startConnection();

    return () => {
      console.debug("🔌 Stopping SignalR connection & cleaning up handlers...");
      newConnection.off("ReceiveNotification");
      newConnection.off("EntityChanged");
      newConnection.off("EntityBatchChanged");
      newConnection.off("SubtleRoll");
      newConnection.stop();
    };
  }, [token, userId]);

  return {
    connection,
    isConnected,
    connectionId: connection?.connectionId,
  };
};
