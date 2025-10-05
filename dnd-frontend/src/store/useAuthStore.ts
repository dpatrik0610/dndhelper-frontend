import { create } from 'zustand'

interface AuthState {
  token: string | null
  username: string | null
  roles?: string[]
  setToken: (token: string, username: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthState>((set: (state: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void) => ({
  token: null,
  username: null,
  roles: [],
  setToken: (token: string, username: string) => set({ token, username }),
  clearToken: () => set({ token: null, username: null }),
}))
