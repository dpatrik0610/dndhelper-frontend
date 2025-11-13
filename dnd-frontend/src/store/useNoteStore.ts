import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Note } from "../types/Note";
import {
  getNoteById,
  getManyNotes,
  createNote,
  updateNote,
  deleteNote,
  getNotesForCharacter,
} from "../services/noteService";
import { useAuthStore } from "./useAuthStore";

interface NoteState {
  notes: Note[];
  loading: boolean;

  loadOne: (id: string) => Promise<Note | null>;
  loadMany: (ids: string[]) => Promise<Note[]>;
  loadForCharacter: (ids: string[]) => Promise<Note[]>;

  create: (note: Partial<Note>) => Promise<Note>;
  update: (id: string, note: Partial<Note>) => Promise<Note>;
  remove: (id: string) => Promise<void>;

  clear: () => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      loading: false,

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

      loadForCharacter: async (ids: string[]) => {
        const token = useAuthStore.getState().token;
        if (!token || ids.length === 0) return [];

        set({ loading: true });

        try {
          const fetched = await getNotesForCharacter(ids, token);

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

      update: async (id: string, note: Partial<Note>) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error("No token");

        set({ loading: true });

        try {
          const updated = await updateNote(id, note, token);

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

      clear: () => set({ notes: [] }),
    }),
    {
      name: "note-store",
      partialize: (state) => ({
        notes: state.notes,
      }),
    }
  )
);
