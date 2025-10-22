import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  id: string | null;
  username: string | null;
  roles: string[];

  // actions
  setAuthData: (data: {
    token: string;
    id: string;
    username: string;
    roles?: string[];
  }) => void;

  clearAuthData: () => void;

  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      id: null,
      username: null,
      roles: [],

      setAuthData: ({ token, id, username, roles = [] }) =>
        set({ token, id, username, roles }),

      clearAuthData: () =>
        set({ token: null, id: null, username: null, roles: [] }),

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
