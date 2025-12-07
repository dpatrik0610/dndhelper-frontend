import { create } from "zustand";
import type { SidebarThemeVariant } from "@features/navigation/Sidebar/sidebarThemes";

interface UiState {
  sidebarTheme: SidebarThemeVariant;
  setSidebarTheme: (theme: SidebarThemeVariant) => void;
}

const getInitialSidebarTheme = (): SidebarThemeVariant => {
  if (typeof window === "undefined") return "sunset";
  const stored = window.localStorage.getItem("sidebarTheme") as SidebarThemeVariant | null;
  return stored ?? "sunset";
};

export const useUiStore = create<UiState>((set) => ({
  sidebarTheme: getInitialSidebarTheme(),
  setSidebarTheme: (theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebarTheme", theme);
    }
    set({ sidebarTheme: theme });
  },
}));
