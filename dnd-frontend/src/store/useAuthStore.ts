import { create } from "zustand";

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
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  id: null,
  username: null,
  roles: [],

  setAuthData: ({ token, id, username, roles = [] }) =>
    set({ token, id, username, roles }),

  clearAuthData: () =>
    set({ token: null, id: null, username: null, roles: [] }),
}));
