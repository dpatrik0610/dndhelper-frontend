import { useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { showNotification } from "@components/Notification/Notification";
import { useToken } from "@store/auth/authSelectors";
import { useAuthStore } from "@store/auth/authStore";
import { useChatStore } from "@store/chat/chatStore";
import type { ChatCampaign, ChatMessage, ChatPage, ChatRoom, ChatSendRequest } from "@appTypes/Chat";

const API_BASE: string = import.meta.env.VITE_API_BASE || "https://localhost:7222/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

const retryDelay = (attempt: number) => Math.min(30_000, 1000 * 2 ** attempt);

// One chat connection per tab; views call the helpers below.
let active: HubConnection | null = null;

function hubError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  // Server HubException text arrives as "...HubException: <message>"
  return message.includes("HubException: ") ? message.split("HubException: ").pop()! : message;
}

/** Invokes a hub method; failures become a notification and resolve to `ok: false`. */
async function invoke<T>(method: string, args: unknown[]): Promise<{ ok: boolean; value?: T }> {
  if (!active || active.state !== HubConnectionState.Connected) {
    showNotification({ message: "Chat isn't connected.", color: "yellow" });
    return { ok: false };
  }
  try {
    return { ok: true, value: await active.invoke<T>(method, ...args) };
  } catch (err) {
    showNotification({ message: hubError(err), color: "red" });
    return { ok: false };
  }
}

/** Actions on the open campaign chat. New, changed and removed messages come back as events. */
export const chat = {
  send: async (request: ChatSendRequest) => (await invoke("Send", [request])).ok,
  edit: async (messageId: string, text: string) => (await invoke("Edit", [messageId, text])).ok,
  remove: async (messageId: string) => (await invoke("Delete", [messageId])).ok,
  history: async (beforeId: string) => (await invoke<ChatPage>("History", [beforeId])).value,
};

/**
 * Connects to /hubs/chat while signed in and keeps the chat store on `campaignId`'s chat (null = none open).
 * Mount it once per page: the tabletop for its campaign, the floating chat for the picked one.
 */
export function useChatHub(campaignId: string | null) {
  const token = useToken();
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    if (!token) return;
    const store = useChatStore.getState;
    const conn = new HubConnectionBuilder()
      .withUrl(`${API_ORIGIN}/hubs/chat`, { accessTokenFactory: () => useAuthStore.getState().token ?? "" })
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: ({ previousRetryCount }) => retryDelay(previousRetryCount) })
      .configureLogging(LogLevel.Warning)
      .build();

    const isMine = (m: ChatMessage) => m.userId === useAuthStore.getState().id;
    conn.on("ChatAdded", (m: ChatMessage) => store().add(m, isMine(m)));
    conn.on("ChatUpdated", (m: ChatMessage) => store().update(m));
    conn.on("ChatRemoved", (id: string) => store().remove(id));

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const loadCampaigns = async () => {
      try {
        store().set({ campaigns: await conn.invoke<ChatCampaign[]>("Campaigns") });
      } catch {
        store().set({ campaigns: [] });
      }
    };

    // Groups don't survive a reconnect: open the same campaign again.
    const reopen = async () => {
      const room = store().room;
      if (!room) return;
      try {
        store().opened(await conn.invoke<ChatRoom>("Open", room.campaignId));
      } catch (err) {
        store().set({ error: hubError(err) });
      }
    };

    const connect = async (attempt: number) => {
      try {
        await conn.start();
      } catch {
        if (!cancelled) retryTimer = setTimeout(() => void connect(attempt + 1), retryDelay(attempt));
        return;
      }
      if (cancelled) return;
      active = conn;
      store().set({ connected: true });
      setConnection(conn);
      await loadCampaigns();
      if (attempt > 0) await reopen();
    };

    conn.onreconnecting(() => store().set({ connected: false }));
    conn.onreconnected(async () => {
      store().set({ connected: true });
      await loadCampaigns();
      await reopen();
    });
    conn.onclose(() => {
      store().set({ connected: false });
      if (!cancelled) retryTimer = setTimeout(() => void connect(1), retryDelay(0));
    });

    void connect(0);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      if (active === conn) active = null;
      setConnection(null);
      store().reset();
      void conn.stop();
    };
  }, [token]);

  useEffect(() => {
    if (!connection) return;
    const store = useChatStore.getState;
    if (!campaignId) {
      store().set({ room: null, messages: [], hasMore: false, error: null });
      return;
    }
    let cancelled = false;
    connection
      .invoke<ChatRoom>("Open", campaignId)
      .then((room) => {
        if (!cancelled) store().opened(room);
      })
      .catch((err) => {
        if (!cancelled) store().set({ room: null, messages: [], hasMore: false, error: hubError(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [connection, campaignId]);
}
