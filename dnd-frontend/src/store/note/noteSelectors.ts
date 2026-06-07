import { useNoteStore } from "./noteStore";
import { useShallow } from "zustand/react/shallow";

// Data Selectors
export const useNoteList = () => useNoteStore((s) => s.notes);
export const useNoteLoading = () => useNoteStore((s) => s.loading);

// Action Selectors
export const useNoteActions = () => useNoteStore(useShallow((s) => ({
  getById: s.getById,
  getForCharacter: s.getForCharacter,
  loadOne: s.loadOne,
  loadMany: s.loadMany,
  loadForCharacter: s.loadForCharacter,
  create: s.create,
  update: s.update,
  remove: s.remove,
  clearStore: s.clearStore,
})));
