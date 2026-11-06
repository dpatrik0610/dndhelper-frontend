import { useCallback, useEffect, useRef, useState } from "react";
import type { MusicState } from "@appTypes/Music";
import { useMusicStore } from "@store/music/musicStore";
import { getServerNow, library, uploadWithProgress } from "@services/musicService";
import { readTags, withoutTags } from "./tags";

export const message = (err: unknown) => (err instanceof Error && err.message ? err.message : "Something went wrong. Try again.");

export const useMusicCampaign = () => useMusicStore((s) => s.campaignId) ?? "";

export function useRunner() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setError(message(err));
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run, setError };
}

export const MAX_MB = 50;

function readDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  return new Promise<number>((resolve, reject) => {
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => {
      if (Number.isFinite(a.duration)) return resolve(a.duration);
      a.ontimeupdate = () => {
        a.ontimeupdate = null;
        resolve(a.duration);
      };
      a.currentTime = 1e9;
    };
    a.onerror = () => reject(new Error(`This browser can’t play “${file.name}”.`));
    a.src = url;
  }).finally(() => URL.revokeObjectURL(url));
}

async function hashOf(audio: Blob) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", await audio.arrayBuffer()));
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}

const AUDIO_TYPES: Record<string, string> = { mp3: "audio/mpeg", ogg: "audio/ogg", opus: "audio/ogg", m4a: "audio/mp4", flac: "audio/flac", wav: "audio/wav" };
const extOf = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";
export const isAudio = (file: File) => file.type.startsWith("audio/") || Object.hasOwn(AUDIO_TYPES, extOf(file));
export const ACCEPT = ["audio/*", ...Object.keys(AUDIO_TYPES).map((ext) => `.${ext}`)].join(",");

export const titleFrom = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/_/g, " ")
    .replace(/^\d{1,3}\s*[-.)]\s*/, "")
    .trim();

export type Upload = { key: string; name: string; progress: number };

export function useAddFile() {
  const cid = useMusicCampaign();
  return async (collectionId: string | null, file: File, onProgress: (f: number) => void) => {
    const audio = await withoutTags(file);
    if (audio.size > MAX_MB * 1024 * 1024) throw new Error(`“${file.name}” is over ${MAX_MB} MB.`);
    const hash = await hashOf(audio);
    if ((await library.reuseTrack(cid, hash, collectionId))?.reused) return;
    const [duration, tags] = await Promise.all([readDuration(file), readTags(file)]);
    const form = new FormData();
    form.append("file", audio, file.name);
    if (tags.cover) form.append("cover", tags.cover, "cover.jpg");
    if (collectionId) form.append("collectionId", collectionId);
    form.append("title", tags.title ?? (titleFrom(file.name) || file.name));
    if (tags.artist) form.append("artist", tags.artist);
    form.append("duration", String(duration));
    await uploadWithProgress(cid, "tracks", form, onProgress);
  };
}

export function useLibraryRunner() {
  const loadLibrary = useMusicStore((s) => s.loadLibrary);
  const runner = useRunner();
  const act = (fn: () => Promise<unknown>) =>
    runner.run(async () => {
      await fn();
      await loadLibrary();
    });
  return { ...runner, act };
}

export function useServerClock(campaignId: string) {
  const offset = useRef(0);
  useEffect(() => {
    if (!campaignId) return;
    let stopped = false;
    const measure = async () => {
      let best = Infinity;
      for (let i = 0; i < 4 && !stopped; i++) {
        try {
          const sent = Date.now();
          const t0 = performance.now();
          const server = await getServerNow(campaignId);
          const rtt = performance.now() - t0;
          if (rtt < best) {
            best = rtt;
            offset.current = server - (sent + rtt / 2);
          }
        } catch {
          break;
        }
      }
    };
    void measure();
    const t = setInterval(measure, 10 * 60_000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [campaignId]);
  return useCallback(() => Date.now() + offset.current, []);
}

export function usePlayerRunner() {
  const cid = useMusicCampaign();
  const receive = useMusicStore((s) => s.receive);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);
  const run = useCallback(
    async (fn: () => Promise<MusicState | void | null>) => {
      setError(null);
      try {
        const next = await fn();
        if (next) receive(cid, next);
      } catch (err) {
        setError(message(err));
      }
    },
    [cid, receive],
  );
  return { cid, run, error };
}

export type PlayerRun = ReturnType<typeof usePlayerRunner>["run"];
