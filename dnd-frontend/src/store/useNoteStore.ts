import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Note } from "@appTypes/Note";
import {
  getNoteById,
  getManyNotes,
  createNote,
  updateNote,
  deleteNote,
} from "@services/noteService";
import { useAuthStore } from "@store/useAuthStore";

interface NoteState {
  notes: Note[];
  loading: boolean;

  getById: (id: string) => Note | undefined;
  getForCharacter: (noteIds: string[]) => Note[];

  loadOne: (id: string) => Promise<Note | null>;
  loadMany: (ids: string[]) => Promise<Note[]>;
  loadForCharacter: (noteIds: string[]) => Promise<Note[]>;

  create: (note: Partial<Note>) => Promise<Note>;
  update: (id: string, note: Partial<Note>) => Promise<Note>;
  remove: (id: string) => Promise<void>;

  clearStore: () => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      loading: false,

      getById: (id: string) => get().notes.find((n) => n.id === id),

      getForCharacter: (noteIds: string[]) =>
        get().notes.filter((n) => n.id && noteIds.includes(n.id)),

      loadOne: async (id: string) => {
        const token = useAuthStore.getState().token;
        if (!token) return null;

        set({ loading: true });

        try {
          const note = await getNoteById(id, token);

          set((state) => ({
            notes: [...state.notes.filter((n) => n.id !== id), note],
          }));

          return note;
        } finally {
          set({ loading: false });
        }
      },

      loadMany: async (ids: string[]) => {
        const token = useAuthStore.getState().token;
        if (!token || ids.length === 0) return [];

        set({ loading: true });

        try {
          const fetched = await getManyNotes(ids, token);

          set((state) => ({
            notes: [
              ...state.notes.filter((n) => !ids.includes(n.id!)),
              ...fetched,
            ],
          }));

          return fetched;
        } finally {
          set({ loading: false });
        }
      },

      loadForCharacter: async (noteIds: string[]) => {
        const token = useAuthStore.getState().token;
        if (!token || noteIds.length === 0) return [];

        const uniqueIds = Array.from(new Set(noteIds)).filter(Boolean) as string[];

        set({ loading: true });

        try {
          const fetched = await getManyNotes(uniqueIds, token);
          const filtered = fetched.filter((n) => !n.isDeleted);

          set((state) => ({
            notes: [
              ...state.notes.filter((n) => !uniqueIds.includes(n.id!)),
              ...filtered,
            ],
          }));

          return filtered;
        } finally {
          set({ loading: false });
        }
      },

      create: async (note: Partial<Note>) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error("No token");

        set({ loading: true });

        try {
          const created = await createNote(note, token);

          set((state) => ({
            notes: [...state.notes, created],
          }));

          return created;
        } finally {
          set({ loading: false });
        }
      },

      update: async (id: string, patch: Partial<Note>) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error("No token");

        set({ loading: true });

        try {
          const current = get().notes.find((n) => n.id === id);
          if (!current) {
            throw new Error(`Note with id ${id} not found in store`);
          }

          const toSend: Note = {
            ...current,
            ...patch,
          };

          const updated = await updateNote(id, toSend, token);

          set((state) => ({
            notes: state.notes.map((n) => (n.id === id ? updated : n)),
          }));

          return updated;
        } finally {
          set({ loading: false });
        }
      },

      remove: async (id: string) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error("No token");

        set({ loading: true });

        try {
          await deleteNote(id, token);

          set((state) => ({
            notes: state.notes.filter((n) => n.id !== id),
          }));
        } finally {
          set({ loading: false });
        }
      },

      clearStore: () => set({ notes: [], loading: false }),
    }),
    {
      name: "note-store",
      partialize: (state) => ({
        notes: state.notes,
      }),
    }
  )
);
