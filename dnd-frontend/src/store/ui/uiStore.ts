import { create } from "zustand";
import type { SidebarThemeVariant } from "@appTypes/ThemeTypes";
import { getSelf, updateUserSettings } from "@services/userService";
import { useAuthStore } from "@store/auth/authStore";

export const UI_SCALES = [90, 100, 110, 120] as const;
export const NOTIFICATION_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;
export type NotificationPosition = (typeof NOTIFICATION_POSITIONS)[number];

/** Site preferences. Stored as flat string keys next to sidebarTheme, both in localStorage and the backend. */
export interface SitePrefs {
  /** Root font size in percent; scales all rem-based UI. */
  uiScale: number;
  animatedBackground: boolean;
  diceAnimation: boolean;
  notificationPosition: NotificationPosition;
  /** Forces reduced motion even when the OS doesn't ask for it. */
  reduceMotion: boolean;
  /** Drops glass blur and the animated background for weaker devices. */
  performanceMode: boolean;
  /** Campaign chat bubble at the bottom right (not on the tabletop, which has its own). */
  floatingChat: boolean;
}

export const defaultPrefs: SitePrefs = {
  uiScale: 100,
  animatedBackground: true,
  diceAnimation: true,
  notificationPosition: "bottom-right",
  reduceMotion: false,
  performanceMode: false,
  floatingChat: true,
};

const PREFS_STORAGE_KEY = "sitePrefs";

const prefsToRecord = (prefs: SitePrefs): Record<string, string> => ({
  uiScale: String(prefs.uiScale),
  animatedBackground: String(prefs.animatedBackground),
  diceAnimation: String(prefs.diceAnimation),
  notificationPosition: prefs.notificationPosition,
  reduceMotion: String(prefs.reduceMotion),
  performanceMode: String(prefs.performanceMode),
  floatingChat: String(prefs.floatingChat),
});

/** Parses untrusted strings (localStorage, backend); anything unknown falls back to the default. */
export const prefsFromRecord = (record: Record<string, string | undefined>): SitePrefs => {
  const scale = Number(record.uiScale);
  const position = record.notificationPosition as NotificationPosition;
  return {
    uiScale: (UI_SCALES as readonly number[]).includes(scale) ? scale : defaultPrefs.uiScale,
    animatedBackground: record.animatedBackground !== "false",
    diceAnimation: record.diceAnimation !== "false",
    notificationPosition: NOTIFICATION_POSITIONS.includes(position) ? position : defaultPrefs.notificationPosition,
    reduceMotion: record.reduceMotion === "true",
    performanceMode: record.performanceMode === "true",
    floatingChat: record.floatingChat !== "false",
  };
};

export interface UiState {
  sidebarTheme: SidebarThemeVariant;
  prefs: SitePrefs;
  loadingSettings: boolean;
}

export interface UiActions {
  setSidebarTheme: (theme: SidebarThemeVariant) => void;
  setPref: <K extends keyof SitePrefs>(key: K, value: SitePrefs[K]) => void;
  resetPrefs: () => void;
  fetchSettings: () => Promise<void>;
}

const getInitialSidebarTheme = (): SidebarThemeVariant => {
  if (typeof window === "undefined") return "sunset";
  const stored = window.localStorage.getItem("sidebarTheme") as SidebarThemeVariant | null;
  return stored ?? "sunset";
};

const getInitialPrefs = (): SitePrefs => {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    return prefsFromRecord(JSON.parse(window.localStorage.getItem(PREFS_STORAGE_KEY) ?? "{}"));
  } catch {
    return defaultPrefs;
  }
};

/** Sends every key, not just the changed one, so the PUT is safe whether the backend merges or replaces. */
const syncSettingsToBackend = (state: UiState) => {
  if (!useAuthStore.getState().token) return;
  updateUserSettings({ sidebarTheme: state.sidebarTheme, ...prefsToRecord(state.prefs) }).catch((err) => {
    console.warn("Failed to sync settings to backend", err);
  });
};

const storePrefs = (prefs: SitePrefs) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefsToRecord(prefs)));
  }
};

export const useUiStore = create<UiState & UiActions>((set, get) => ({
  sidebarTheme: getInitialSidebarTheme(),
  prefs: getInitialPrefs(),
  loadingSettings: false,

  setSidebarTheme: (theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebarTheme", theme);
    }
    set({ sidebarTheme: theme });
    syncSettingsToBackend(get());
  },

  setPref: (key, value) => {
    const prefs = { ...get().prefs, [key]: value };
    storePrefs(prefs);
    set({ prefs });
    syncSettingsToBackend(get());
  },

  resetPrefs: () => {
    storePrefs(defaultPrefs);
    set({ prefs: defaultPrefs });
    syncSettingsToBackend(get());
  },

  fetchSettings: async () => {
    if (!useAuthStore.getState().token) return;

    set({ loadingSettings: true });
    try {
      const { settings } = await getSelf();
      if (!settings) return;

      const updatedState: Partial<UiState> = {};

      // Safely extract theme with either camelCase or PascalCase keys
      const sidebarThemeVal = settings.sidebarTheme || settings.SidebarTheme;
      if (sidebarThemeVal) {
        const theme = sidebarThemeVal as SidebarThemeVariant;
        updatedState.sidebarTheme = theme;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sidebarTheme", theme);
        }
      }

      // Backend keys win; keys it doesn't have yet keep the local value.
      updatedState.prefs = prefsFromRecord({ ...prefsToRecord(get().prefs), ...settings });
      storePrefs(updatedState.prefs);

      set(updatedState);
    } catch (err) {
      console.warn("Could not fetch user settings from backend, using local settings.", err);
    } finally {
      set({ loadingSettings: false });
    }
  },
}));
