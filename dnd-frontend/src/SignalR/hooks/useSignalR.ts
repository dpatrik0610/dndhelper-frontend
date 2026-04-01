import { useEffect, useState, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { showNotification } from "@components/Notification/Notification";
import { useAuthStore } from "@store/useAuthStore";
import { useSubtleRollStore } from "@store/useSubtleRollStore";
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

  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.id);
  const roles = useAuthStore((state) => state.roles);
  const openSubtleRoll = useSubtleRollStore((state) => state.openRoll);
  const isAdmin = roles.includes("Admin");

  useEffect(() => {
    if (!token || !userId) {
      console.log("âŹ¸ď¸Ź Not authenticated, skipping SignalR connection");
      return;
    }

    const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:7222";
    const baseUrl = API_BASE.replace(/\/api$/, "");

    console.log(`đź”Ś Creating SignalR connection for userId: ${userId}`);

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

    return () => {
      console.log("đź”Ś Stopping SignalR connection...");
      newConnection.stop();
    };
  }, [token, userId]);

  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("âś… SignalR Connected!");
        setIsConnected(true);

        connection.on("ReceiveNotification", (message: SignalRMessage) => {
          console.log("đź“¨ Received notification:", message);

          showNotification({
            title: `Message from ${message.sender}`,
            message: message.content,
            color: "blue",
            autoClose: 5000,
          });
        });

        connection.on("EntityChanged", (event: EntityChangeEvent) => {
          console.log("đź§© EntityChanged received:", event);
          EntitySyncManager.handleEntityChange(event);
        });

        connection.on(
          "EntityBatchChanged",
          (batch: {
            correlationId: string;
            timestamp: string;
            changes: EntityChangeEvent[];
          }) => {
            console.log("đź“¦ EntityBatchChanged received:", batch);
            batch.changes.forEach((event) => {
              EntitySyncManager.handleEntityChange(event);
            });
          }
        );

        connection.on("SubtleRoll", (payload: SubtleRollEvent) => {
          if (!isAdmin) return;

          console.log("SubtleRoll received:", payload);

          showNotification({
            title: `Subtle roll from ${payload.characterName}`,
            message: "Click to view details",
            color: "violet",
            autoClose: false,
            onClick: () => openSubtleRoll(payload),
          });
        });
      } catch (err) {
        console.error("âťŚ SignalR Connection Error:", err);
        setIsConnected(false);
      }
    };

    startConnection();

    connection.onreconnecting((error) => {
      console.log("đź”„ SignalR Reconnecting...", error);
      setIsConnected(false);
    });

    connection.onreconnected((connectionId) => {
      console.log("âś… SignalR Reconnected!", connectionId);
      setIsConnected(true);

      showNotification({
        message: "Reconnected to server",
        color: "green",
        autoClose: 2000,
      });
    });

    connection.onclose((error) => {
      console.log("đź”´ SignalR Connection closed", error);
      setIsConnected(false);
    });

    return () => {
      connection.off("ReceiveNotification");
      connection.off("EntityChanged");
      connection.off("EntityBatchChanged");
      connection.off("SubtleRoll");
    };
  }, [connection, isAdmin, openSubtleRoll]);

  return {
    connection,
    isConnected,
    connectionId: connection?.connectionId,
  };
};
