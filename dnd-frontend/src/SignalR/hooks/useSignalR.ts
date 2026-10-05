import { useEffect, useState, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { showNotification } from "@components/Notification/Notification";
import { useToken, useCurrentUserId } from "@store/auth/authSelectors";
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
  const openSubtleRoll = useSubtleRollStore((state) => state.openRoll);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Keep latest values in refs to avoid recreating the connection/listeners when they change
  const openSubtleRollRef = useRef(openSubtleRoll);

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
      // The hub puts each connection in its own user group, read from the token.
      .withUrl(`${baseUrl}/hubs/notifications`, { accessTokenFactory: () => token })
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
      showNotification({
        title: `Message from ${message.sender}`,
        message: message.content,
        color: "blue",
        autoClose: 5000,
      });
    });

    newConnection.on("EntityChanged", (event: EntityChangeEvent) => {
      EntitySyncManager.handleEntityChange(event);
    });

    newConnection.on(
      "EntityBatchChanged",
      (batch: {
        correlationId: string;
        timestamp: string;
        changes: EntityChangeEvent[];
      }) => {
        batch.changes.forEach((event) => {
          EntitySyncManager.handleEntityChange(event);
        });
      }
    );

    // The server only sends these to the campaign's DMs.
    newConnection.on("SubtleRoll", (payload: SubtleRollEvent) => {
      showNotification({
        title: `Subtle roll from ${payload.characterName}`,
        message: "Click to view details",
        color: "violet",
        autoClose: false,
        onClick: () => openSubtleRollRef.current(payload),
      });
    });

    newConnection.on(
      "TableInvite",
      (invite: { code: string; campaignName: string; invitedBy: string }) => {
        const id = `table-invite-${invite.code}`;
        showNotification({
          id,
          title: `${invite.invitedBy} opened the ${invite.campaignName} table`,
          message: "Click to join the tabletop",
          color: "violet",
          autoClose: false,
          onClick: () => {
            notifications.hide(id);
            navigateRef.current(`/table/${invite.code}`);
          },
        });
      }
    );

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
