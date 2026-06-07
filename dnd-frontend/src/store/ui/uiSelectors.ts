import { useUiStore } from "./uiStore";

export const useSidebarTheme = () => useUiStore((s) => s.sidebarTheme);
export const useSetSidebarTheme = () => useUiStore((s) => s.setSidebarTheme);
