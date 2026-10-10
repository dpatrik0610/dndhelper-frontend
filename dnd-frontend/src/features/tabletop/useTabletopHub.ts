import { useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { showNotification } from "@components/Notification/Notification";
import { useToken } from "@store/auth/authSelectors";
import { useAuthStore } from "@store/auth/authStore";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type {
  AoeTemplate,
  FogOp,
  FogState,
  GridSettings,
  MapLayer,
  MeasureEvent,
  TableJoinResult,
  TableEncounterSummary,
  TableLogEntry,
  TableParticipant,
  TableResync,
  TableSnapshot,
  TableStroke,
  TableToken,
  TurnEconomy,
} from "@appTypes/Tabletop";

const API_BASE: string = import.meta.env.VITE_API_BASE || "https://localhost:7222/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

/** Uploaded table images are stored as "/api/tabletop/images/{id}" and served by the API origin. */
export const resolveImageUrl = (url: string | null | undefined) =>
  url ? (url.startsWith("/api/") ? API_ORIGIN + url : url) : undefined;

/** Maps land in images/maps/, tokens in images/tokens/ on the CDN. */
export async function uploadTableImage(tableId: string, file: File, kind: "map" | "token"): Promise<string | null> {
  const body = new FormData();
  body.append("file", file);
  const token = useAuthStore.getState().token;
  const res = await fetch(`${API_BASE}/tabletop/${tableId}/images?kind=${kind}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    showNotification({ title: "Upload failed", message: json.message || json.Message || res.statusText, color: "red" });
    return null;
  }
  return json.url as string;
}

const retryDelay = (attempt: number) => Math.min(30_000, 1000 * 2 ** attempt);

// One table connection per tab; components call the helpers below instead of threading it through props.
let active: HubConnection | null = null;

function hubError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  // Server HubException text arrives as "...HubException: <message>"
  return message.includes("HubException: ") ? message.split("HubException: ").pop()! : message;
}

/** Invokes a hub method; failures become a notification and resolve to `ok: false`. */
async function invoke<T>(method: string, args: unknown[]): Promise<{ ok: boolean; value?: T }> {
  if (!active || active.state !== HubConnectionState.Connected) {
    showNotification({ message: "Not connected to the table.", color: "yellow" });
    return { ok: false };
  }
  try {
    return { ok: true, value: await active.invoke<T>(method, ...args) };
  } catch (err) {
    showNotification({ message: hubError(err), color: "red" });
    return { ok: false };
  }
}

const call = async <T = void>(method: string, ...args: unknown[]) => (await invoke<T>(method, args)).value;

export const tabletop = {
  openForCampaign: (campaignId: string) => call<string>("OpenForCampaign", campaignId),
  moveToken: async (tokenId: string, x: number, y: number, distanceFt: number) =>
    (await invoke("MoveToken", [tokenId, x, y, Math.round(distanceFt)])).ok,
  upsertToken: (token: Partial<TableToken>) => call("UpsertToken", token),
  /** Saves a change to an existing token (the server takes the whole token). */
  patchToken: (token: TableToken, patch: Partial<TableToken>) => call("UpsertToken", { ...token, ...patch }),
  /** Player characters always go on the play layer. */
  placeCharacter: (characterId: string, x: number, y: number) =>
    call("UpsertToken", { characterId, x, y, color: "#60a5fa", layer: "Token" }),
  removeToken: (tokenId: string) => call("RemoveToken", tokenId),
  setEconomy: (tokenId: string, economy: TurnEconomy) => call("SetEconomy", tokenId, economy),
  /** Typed value, or null to roll d20 + the character's initiative bonus on the server. */
  setInitiative: (tokenId: string, value: number | null) => invoke<TableLogEntry | null>("SetInitiative", [tokenId, value]),
  updateGrid: (grid: GridSettings) => call("UpdateGrid", grid),
  updateMap: (map: MapLayer) => call("UpdateMap", map),
  startCombat: () => call("StartCombat"),
  endCombat: () => call("EndCombat"),
  setTurn: (tokenId: string) => call("SetTurn", tokenId),
  endTurn: () => call("EndTurn"),
  addStroke: (stroke: Pick<TableStroke, "color" | "width" | "points" | "layer">) => call("AddStroke", stroke),
  removeStroke: (strokeId: string) => call("RemoveStroke", strokeId),
  clearStrokes: () => call("ClearStrokes"),
  addTemplate: (template: Omit<AoeTemplate, "id" | "userId">) => call("AddTemplate", template),
  removeTemplate: (templateId: string) => call("RemoveTemplate", templateId),
  clearTemplates: () => call("ClearTemplates"),
  setFogEnabled: (enabled: boolean) => call("SetFogEnabled", enabled),
  addFogOp: (op: Omit<FogOp, "id">) => call("AddFogOp", op),
  undoFog: () => call("UndoFog"),
  resetFog: (revealAll: boolean) => call("ResetFog", revealAll),
  roll: (request: { label?: string; expressions: string[]; as?: string; private?: boolean }) =>
    call<TableLogEntry>("Roll", { private: false, ...request }),
  invitePlayers: () => call<number>("InvitePlayers"),
  listEncounters: () => call<TableEncounterSummary[]>("ListEncounters"),
  startEncounter: async (name: string) => (await invoke("StartEncounter", [name || null])).ok,
  endEncounter: async () => (await invoke("EndEncounter", [])).ok,
  loadEncounter: async (encounterId: string) => (await invoke("LoadEncounter", [encounterId])).ok,
  deleteEncounter: async (encounterId: string) => (await invoke("DeleteEncounter", [encounterId])).ok,
  regenerateCode: () => call<string>("RegenerateCode"),
  kick: async (userId: string) => (await invoke("Kick", [userId])).ok,
  /** Resolves to how many players were removed. */
  kickAll: () => call<number>("KickAll"),
  /** Fire-and-forget: a dropped ruler frame doesn't matter. */
  measure: (points: number[] | null) => {
    if (active?.state === HubConnectionState.Connected) void active.invoke("Measure", points).catch(() => {});
  },
};

/** Connects to /hubs/tabletop and, when a code is given, joins that table and keeps the store in sync. */
export function useTabletopHub(code: string | undefined) {
  const token = useToken();
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    if (!token) return;
    const store = useTabletopStore.getState;

    const conn = new HubConnectionBuilder()
      .withUrl(`${API_ORIGIN}/hubs/tabletop`, { accessTokenFactory: () => useAuthStore.getState().token ?? "" })
      // Keep trying forever (1s, 2s, 4s … capped at 30s): an API restart can take longer than the default ~42s.
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: ({ previousRetryCount }) => retryDelay(previousRetryCount) })
      .configureLogging(LogLevel.Warning)
      .build();

    conn.on("State", (snapshot: TableSnapshot) => store().setSnapshot(snapshot));
    conn.on("StrokeAdded", (stroke: TableStroke) => store().addStroke(stroke));
    conn.on("StrokeRemoved", (strokeId: string) => store().removeStroke(strokeId));
    conn.on("StrokesCleared", () => store().clearStrokes());
    conn.on("FogChanged", (fog: FogState) => store().setFog(fog));
    conn.on("FogOpAdded", (op: FogOp) => store().addFogOp(op));
    conn.on("LogAdded", (entry: TableLogEntry) => store().addLog(entry));
    conn.on("Measure", (measure: MeasureEvent) => store().setMeasure(measure));
    conn.on("CodeChanged", (newCode: string) => store().setCode(newCode));
    conn.on("Resync", (payload: TableResync) => store().resync(payload));
    conn.on("Participants", (participants: TableParticipant[]) => store().set({ participants }));
    // Dropping the session also stops the reconnect logic from joining again.
    conn.on("Kicked", () => {
      store().reset();
      store().setJoinError("The DM removed you from the table.");
    });

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    // Groups don't survive a reconnect: join again and take the fresh state.
    const rejoin = async () => {
      const joinCode = store().session?.joinCode;
      if (!joinCode) return;
      try {
        store().joined(await conn.invoke<TableJoinResult>("Join", joinCode));
      } catch (err) {
        store().setJoinError(hubError(err));
      }
    };

    // First connect, and again whenever the connection fully closes, until this effect is torn down.
    const connect = async (attempt: number) => {
      try {
        await conn.start();
      } catch (err) {
        if (cancelled) return;
        if (attempt === 0) store().setJoinError(`Can't reach the table server yet, retrying… (${hubError(err)})`);
        retryTimer = setTimeout(() => void connect(attempt + 1), retryDelay(attempt));
        return;
      }
      if (cancelled) return;
      active = conn;
      store().setConnected(true);
      setConnection(conn);
      if (attempt > 0) await rejoin(); // the join effect handles the first time
    };

    conn.onreconnecting(() => store().setConnected(false));
    conn.onreconnected(async () => {
      store().setConnected(true);
      await rejoin();
    });
    conn.onclose(() => {
      store().setConnected(false);
      if (!cancelled) retryTimer = setTimeout(() => void connect(1), retryDelay(0));
    });

    void connect(0);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      if (active === conn) active = null;
      setConnection(null);
      store().setConnected(false);
      void conn.stop();
    };
  }, [token]);

  useEffect(() => {
    if (!connection || !code) return;
    const store = useTabletopStore.getState;
    let cancelled = false;

    connection
      .invoke<TableJoinResult>("Join", code)
      .then((result) => {
        if (!cancelled) store().joined(result);
      })
      .catch((err) => {
        if (!cancelled) store().setJoinError(hubError(err));
      });

    return () => {
      cancelled = true;
      if (connection.state === HubConnectionState.Connected) void connection.invoke("Leave").catch(() => {});
      store().reset();
    };
  }, [connection, code]);
}
