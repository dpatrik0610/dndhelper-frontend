import { create } from "zustand";
import type { ChronicleEntry, ChronicleEntryInput, ChronicleFolder, ChronicleFolderInput } from "@appTypes/Chronicle";
import * as api from "@services/chronicleService";

interface ChronicleStore {
  entries: ChronicleEntry[];
  folders: ChronicleFolder[];
  campaignId: string | null;
  loading: boolean;
  /** Bumped per entry when its discussion changes, so an open thread knows to refetch. */
  commentTick: Record<string, number>;

  load: (campaignId: string) => Promise<void>;
  reloadFolders: () => Promise<void>;
  /** Refetch one entry with our own permissions; drops it when it's gone or no longer shared. Returns it if visible. */
  refresh: (id: string) => Promise<ChronicleEntry | null>;
  upsert: (entry: ChronicleEntry) => void;
  removeLocal: (id: string) => void;
  bumpComments: (entryId: string) => void;
  clear: () => void;

  create: (input: ChronicleEntryInput) => Promise<ChronicleEntry>;
  update: (id: string, input: ChronicleEntryInput) => Promise<ChronicleEntry>;
  remove: (id: string) => Promise<void>;
  createFolder: (input: ChronicleFolderInput) => Promise<ChronicleFolder>;
  updateFolder: (id: string, input: ChronicleFolderInput) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
}

export const useChronicleStore = create<ChronicleStore>((set, get) => ({
  entries: [],
  folders: [],
  campaignId: null,
  loading: false,
  commentTick: {},

  load: async (campaignId) => {
    const same = get().campaignId === campaignId;
    set({ loading: true, campaignId, entries: same ? get().entries : [], folders: same ? get().folders : [] });
    try {
      const [entries, folders] = await Promise.all([api.getCampaignEntries(campaignId), api.getCampaignFolders(campaignId)]);
      if (get().campaignId === campaignId) set({ entries: entries ?? [], folders: folders ?? [] });
    } finally {
      set({ loading: false });
    }
  },

  reloadFolders: async () => {
    const campaignId = get().campaignId;
    if (!campaignId) return;
    const folders = await api.getCampaignFolders(campaignId);
    if (get().campaignId === campaignId) set({ folders: folders ?? [] });
  },

  refresh: async (id) => {
    try {
      const entry = await api.getEntry(id);
      get().upsert(entry);
      return entry;
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 404 || status === 403) get().removeLocal(id);
      return null;
    }
  },

  upsert: (entry) =>
    set((s) => {
      if (entry.campaignId !== s.campaignId) return s;
      return s.entries.some((e) => e.id === entry.id)
        ? { entries: s.entries.map((e) => (e.id === entry.id ? entry : e)) }
        : { entries: [...s.entries, entry] };
    }),

  removeLocal: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

  bumpComments: (entryId) => set((s) => ({ commentTick: { ...s.commentTick, [entryId]: (s.commentTick[entryId] ?? 0) + 1 } })),

  clear: () => set({ entries: [], folders: [], campaignId: null, loading: false, commentTick: {} }),

  create: async (input) => {
    const entry = await api.createEntry(input);
    get().upsert(entry);
    return entry;
  },
  update: async (id, input) => {
    const entry = await api.updateEntry(id, input);
    get().upsert(entry);
    return entry;
  },
  remove: async (id) => {
    await api.deleteEntry(id);
    get().removeLocal(id);
  },

  createFolder: async (input) => {
    const folder = await api.createFolder(input);
    set((s) => (folder.campaignId === s.campaignId && !s.folders.some((f) => f.id === folder.id) ? { folders: [...s.folders, folder] } : s));
    return folder;
  },
  updateFolder: async (id, input) => {
    const folder = await api.updateFolder(id, input);
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? folder : f)) }));
  },
  removeFolder: async (id) => {
    await api.deleteFolder(id);
    const campaignId = get().campaignId;
    if (campaignId) await get().load(campaignId);
  },
}));
