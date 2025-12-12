import { create } from "zustand";
import { type RuleDetail } from "@appTypes/Rules/Rule";

export interface RulesUiState {
  topic: string;
  searchTerm: string;
  page: number;
  selectedSlug: string | null;
  selectedDetail: RuleDetail | null;
  setTopic: (topic: string) => void;
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  setSelectedSlug: (slug: string | null) => void;
  setSelectedDetail: (detail: RuleDetail | null) => void;
}

export const useRulesUiStore = create<RulesUiState>((set) => ({
  topic: "all",
  searchTerm: "",
  page: 1,
  selectedSlug: null,
  selectedDetail: null,
  setTopic: (topic) => set({ topic }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setPage: (page) => set({ page }),
  setSelectedSlug: (selectedSlug) => set({ selectedSlug }),
  setSelectedDetail: (selectedDetail) => set({ selectedDetail }),
}));
