import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthState {
  token: string | null;
  id: string | null;
  username: string | null;
  roles: string[];
}

export interface AuthActions {
  setAuthData: (data: {
    token: string;
    id: string;
    username: string;
    roles?: string[];
  }) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // State
      token: null,
      id: null,
      username: null,
      roles: [],

      // Actions
      setAuthData: ({ token, id, username, roles = [] }) =>
        set({ token, id, username, roles }),

      setToken: (token) => set({ token }),

      logout: () => {
        localStorage.removeItem("authToken");
        set({ token: null, id: null, username: null, roles: [] });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        id: state.id,
        username: state.username,
        roles: state.roles,
      }),
    }
  )
);
