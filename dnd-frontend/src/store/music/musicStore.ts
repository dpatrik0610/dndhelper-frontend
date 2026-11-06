import { create } from "zustand";
import type { MusicLibrary, MusicState } from "@appTypes/Music";
import { getMusicLibrary, getMusicState } from "@services/musicService";

const LISTEN_KEY = "bardify-listening";

const readListening = () => {
  try {
    return localStorage.getItem(LISTEN_KEY) === "1";
  } catch {
    return false;
  }
};

interface MusicStore {
  campaignId: string | null;
  state: MusicState | null;
  library: MusicLibrary | null;
  listening: boolean;
  setListening: (on: boolean) => void;
  open: (campaignId: string | null) => Promise<void>;
  receive: (campaignId: string, state: MusicState) => void;
  loadLibrary: () => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  campaignId: null,
  state: null,
  library: null,
  listening: readListening(),

  setListening: (on) => {
    try {
      localStorage.setItem(LISTEN_KEY, on ? "1" : "0");
    } catch {
      void 0;
    }
    set({ listening: on });
  },

  open: async (campaignId) => {
    if (get().campaignId === campaignId) return;
    set({ campaignId, state: null, library: null });
    if (!campaignId) return;
    try {
      const state = await getMusicState(campaignId);
      get().receive(campaignId, state);
    } catch {
      set((s) => (s.campaignId === campaignId ? { state: null } : s));
    }
  },

  receive: (campaignId, state) =>
    set((s) => (s.campaignId !== campaignId || (s.state && state.rev < s.state.rev) ? s : { state })),

  loadLibrary: async () => {
    const campaignId = get().campaignId;
    if (!campaignId) return;
    const library = await getMusicLibrary(campaignId);
    set((s) => (s.campaignId === campaignId ? { library } : s));
  },
}));
