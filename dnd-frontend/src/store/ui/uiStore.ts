import { create } from "zustand";
import type { SidebarThemeVariant } from "@appTypes/ThemeTypes";
import { getSelf, getAuthMe, getAuthUser, getUserById, getUserSettings, updateUserSettings } from "@services/userService";
import { useAuthStore } from "@store/auth/authStore";

export interface UiState {
  sidebarTheme: SidebarThemeVariant;
  loadingSettings: boolean;
}

export interface UiActions {
  setSidebarTheme: (theme: SidebarThemeVariant) => void;
  fetchSettings: () => Promise<void>;
  saveSettings: (settings: Record<string, string>) => Promise<void>;
}

const getInitialSidebarTheme = (): SidebarThemeVariant => {
  if (typeof window === "undefined") return "sunset";
  const stored = window.localStorage.getItem("sidebarTheme") as SidebarThemeVariant | null;
  return stored ?? "sunset";
};

export const useUiStore = create<UiState & UiActions>((set) => ({
  sidebarTheme: getInitialSidebarTheme(),
  loadingSettings: false,

  setSidebarTheme: (theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebarTheme", theme);
    }
    set({ sidebarTheme: theme });

    // Sync to backend if authenticated
    const token = useAuthStore.getState().token;
    if (token) {
      updateUserSettings({ 
        sidebarTheme: theme
      }).catch((err) => {
        console.warn("Failed to sync sidebarTheme to backend", err);
      });
    }
  },

  fetchSettings: async () => {
    const authState = useAuthStore.getState();
    const token = authState.token;
    const userId = authState.id;
    if (!token) return;

    set({ loadingSettings: true });
    try {
      let settings: Record<string, string> | null = null;

      // 1. Try to fetch user data via getSelf (GET /user/me)
      try {
        const userData = await getSelf();
        if (userData && userData.settings) {
          settings = userData.settings;
        }
      } catch (err) {
        console.info("Could not fetch profile via getSelf, trying getAuthMe...", err);
      }

      // 2. Try to fetch user data via getAuthMe (GET /Auth/me)
      if (!settings) {
        try {
          const userData = await getAuthMe();
          if (userData && userData.settings) {
            settings = userData.settings;
          }
        } catch (err) {
          console.info("Could not fetch profile via getAuthMe, trying getAuthUser...", err);
        }
      }

      // 3. Try to fetch user data via getAuthUser (GET /Auth/user)
      if (!settings) {
        try {
          const userData = await getAuthUser();
          if (userData && userData.settings) {
            settings = userData.settings;
          }
        } catch (err) {
          console.info("Could not fetch profile via getAuthUser, trying getUserById...", err);
        }
      }

      // 4. Try to fetch user data via getUserById (GET /user/{id}) using logged-in user's ID
      if (!settings && userId) {
        try {
          const userData = await getUserById(userId);
          if (userData && userData.settings) {
            settings = userData.settings;
          }
        } catch (err) {
          console.info(`Could not fetch profile via getUserById for id ${userId}, trying dedicated settings...`, err);
        }
      }

      // 5. Fallback to dedicated settings endpoint (GET /user/me/settings)
      if (!settings) {
        try {
          settings = await getUserSettings();
        } catch (err) {
          console.info("Could not fetch settings via dedicated endpoint either.", err);
        }
      }

      // 6. Apply settings if found
      if (settings) {
        let updatedState: Partial<UiState> = {};
        
        // Safely extract theme with either camelCase or PascalCase keys
        const sidebarThemeVal = settings.sidebarTheme || settings.SidebarTheme;

        if (sidebarThemeVal) {
          const theme = sidebarThemeVal as SidebarThemeVariant;
          updatedState.sidebarTheme = theme;
          if (typeof window !== "undefined") {
            window.localStorage.setItem("sidebarTheme", theme);
          }
        }

        set(updatedState);
      }
    } catch (err) {
      console.warn("Could not fetch user settings from backend, using local settings.", err);
    } finally {
      set({ loadingSettings: false });
    }
  },

  saveSettings: async (settings) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const updated = await updateUserSettings(settings);
      if (updated) {
        let updatedState: Partial<UiState> = {};
        
        const sidebarThemeVal = updated.sidebarTheme || updated.SidebarTheme;

        if (sidebarThemeVal) {
          const theme = sidebarThemeVal as SidebarThemeVariant;
          updatedState.sidebarTheme = theme;
          if (typeof window !== "undefined") {
            window.localStorage.setItem("sidebarTheme", theme);
          }
        }

        set(updatedState);
      }
    } catch (err) {
      console.error("Failed to save settings to backend:", err);
      throw err;
    }
  }
}));
