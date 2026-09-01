import { create } from "zustand";
import type { SidebarThemeVariant } from "@features/navigation/Sidebar/sidebarThemes";

export interface UiState {
  sidebarTheme: SidebarThemeVariant;
  activeVideoUrl: string;
}

export interface UiActions {
  setSidebarTheme: (theme: SidebarThemeVariant) => void;
  setActiveVideoUrl: (url: string) => void;
}

const getInitialSidebarTheme = (): SidebarThemeVariant => {
  if (typeof window === "undefined") return "sunset";
  const stored = window.localStorage.getItem("sidebarTheme") as SidebarThemeVariant | null;
  return stored ?? "sunset";
};

const getInitialVideoUrl = (): string => {
  if (typeof window === "undefined") return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const stored = window.localStorage.getItem("activeVideoUrl");
  return stored ?? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
};

export const useUiStore = create<UiState & UiActions>((set) => ({
  sidebarTheme: getInitialSidebarTheme(),
  activeVideoUrl: getInitialVideoUrl(),
  setSidebarTheme: (theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebarTheme", theme);
    }
    set({ sidebarTheme: theme });
  },
  setActiveVideoUrl: (url) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("activeVideoUrl", url);
    }
    set({ activeVideoUrl: url });
  },
}));
