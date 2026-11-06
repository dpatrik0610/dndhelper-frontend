import { apiClient } from "@api/apiClient";
import { getAuthTokenSafe } from "@store/auth/authUtils";
import type { Easing, MusicLibrary, MusicState, Repeat, SkipKind } from "@appTypes/Music";

const base = (campaignId: string) => `/campaigns/${campaignId}/music`;
const post = <T = MusicState>(campaignId: string, path: string, body?: unknown) =>
  apiClient<T>(`${base(campaignId)}/${path}`, { method: "POST", body });

export const getMusicState = (c: string) => apiClient<MusicState>(`${base(c)}/state`);
export const getServerNow = (c: string) => apiClient<number>(`${base(c)}/now`);
export const musicHeartbeat = (c: string) => post<void>(c, "heartbeat");
export const getMusicLibrary = (c: string) => apiClient<MusicLibrary>(`${base(c)}/library`);

export const music = {
  play: (c: string) => post(c, "play"),
  pause: (c: string) => post(c, "pause"),
  seek: (c: string, seconds: number) => post(c, "seek", { seconds }),
  skip: (c: string, kind: SkipKind) => post(c, "skip", { kind }),
  shuffle: (c: string, on: boolean) => post(c, "shuffle", { on }),
  repeat: (c: string, mode: Repeat) => post(c, "repeat", { mode }),
  playCollection: (c: string, collectionId: string, from?: string) => post(c, "play-collection", { collectionId, from }),
  enqueue: (c: string, body: { songs?: string[]; collectionId?: string }) => post(c, "enqueue", body),
  playNow: (c: string, song: string) => post(c, "play-now", { song }),
  jump: (c: string, index: number, song: string) => post(c, "jump", { index, song }),
  moveQueued: (c: string, from: number, to: number, song: string) => post(c, "move-queued", { from, to, song }),
  removeQueued: (c: string, index: number, song: string) => post(c, "remove-queued", { index, song }),
  clear: (c: string) => post(c, "clear"),
  settings: (c: string, s: { crossfade?: number; easing?: Easing; softPause?: boolean }) =>
    apiClient<MusicState>(`${base(c)}/settings`, { method: "PUT", body: s }),
  requestSkip: (c: string, kind: SkipKind) => post(c, "votes", { kind }),
  vote: (c: string, id: string, yes: boolean) => post(c, `votes/${id}`, { yes }),
};

const send = <T = void>(c: string, path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown) =>
  apiClient<T>(`${base(c)}/${path}`, { method, body });

export const library = {
  createSituation: (c: string, name: string) => send<{ id: string }>(c, "collections", "POST", { name }),
  renameSituation: (c: string, id: string, name: string) => send(c, `collections/${id}`, "PUT", { name }),
  deleteSituation: (c: string, id: string) => send(c, `collections/${id}`, "DELETE"),
  reorderSituations: (c: string, ids: string[]) => send(c, "collections/order", "PUT", { ids }),
  reorderTracks: (c: string, collectionId: string, ids: string[]) => send(c, `collections/${collectionId}/tracks/order`, "PUT", { ids }),
  reorderLayers: (c: string, collectionId: string, ids: string[]) => send(c, `collections/${collectionId}/layers/order`, "PUT", { ids }),
  reuseTrack: (c: string, hash: string, collectionId: string | null) =>
    send<{ reused: boolean }>(c, "tracks/reuse", "POST", { hash, collectionId }),
  updateTrack: (c: string, id: string, change: { title?: string; artist?: string }) => send(c, `tracks/${id}`, "PATCH", change),
  setCover: (c: string, id: string, cover: Blob) => {
    const form = new FormData();
    form.append("cover", cover, "cover.jpg");
    return send(c, `tracks/${id}/cover`, "PUT", form);
  },
  moveTrack: (c: string, id: string, collectionId: string) => send(c, `tracks/${id}/collection`, "PUT", { collectionId }),
  deleteTrack: (c: string, id: string) => send(c, `tracks/${id}`, "DELETE"),
  moveLayer: (c: string, id: string, collectionId: string) => send(c, `layers/${id}/collection`, "PUT", { collectionId }),
  renameLayer: (c: string, id: string, name: string) => send(c, `layers/${id}/name`, "PUT", { name }),
  setLayer: (c: string, id: string, change: { level?: number; on?: boolean }) => send(c, `layers/${id}`, "PATCH", change),
  deleteLayer: (c: string, id: string) => send(c, `layers/${id}`, "DELETE"),
  playAmbience: (c: string, collectionId: string | null) => send(c, "ambience", "PUT", { collectionId }),
};

export function uploadWithProgress(campaignId: string, path: string, form: FormData, onProgress?: (f: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", `${import.meta.env.VITE_API_BASE}${base(campaignId)}/${path}`);
    const token = getAuthTokenSafe();
    if (token) x.setRequestHeader("Authorization", `Bearer ${token}`);
    x.setRequestHeader("X-Campaign-Id", campaignId);
    if (onProgress) x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    x.onload = () => {
      if (x.status < 300) return resolve();
      let message = "The upload failed. Try again.";
      try {
        const body = JSON.parse(x.responseText);
        message = body.message || body.Message || message;
      } catch {
        message = x.statusText || message;
      }
      reject(new Error(message));
    };
    x.onerror = () => reject(new Error("The upload failed. Check the connection."));
    x.send(form);
  });
}
