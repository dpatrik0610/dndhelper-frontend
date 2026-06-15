import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "@appTypes/Session";
import {
  createSession,
  deleteSession,
  getAllSessions,
  getSessionsByCampaign,
  getSessionById,
  updateSession,
} from "@services/sessionService";

import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

export interface SessionState {
  sessions: Session[];
  selected: Session | null;
  loading: boolean;
  error: string | null;
}

export interface SessionActions {
  loadAll: () => Promise<void>;
  loadByCampaign: (campaignId: string) => Promise<void>;
  loadById: (id: string) => Promise<Session | null>;
  select: (id: string | null) => void;
  create: (session: Session) => Promise<Session | null>;
  update: (session: Session) => Promise<Session | null>;
  remove: (id: string) => Promise<boolean>;
  setLive: (id: string) => Promise<void>;
  clear: () => void;
}

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set, get) => ({
      sessions: [],
      selected: null,
      loading: false,
      error: null,

      async loadAll() {
        set({ loading: true, error: null });
        try {

          const data = await getAllSessions();
          set({
            sessions: data,
            selected: get().selected?.id
              ? data.find((s) => s.id === get().selected?.id) ?? null
              : data[0] ?? null,
          });
        } catch (err) {
          set({ error: String(err) });
          showNotification({
            title: "Failed to load sessions",
            message: String(err),
            color: SectionColor.Red,
          });
        } finally {
          set({ loading: false });
        }
      },

      async loadByCampaign(campaignId) {
        set({ loading: true, error: null });
        try {

          const data = await getSessionsByCampaign(campaignId);
          console.info("[SessionStore] Loaded sessions by campaign", { campaignId, count: data.length });
          set({
            sessions: data,
            selected: data[0] ?? null,
          });
        } catch (err) {
          console.error("[SessionStore] Failed to load sessions by campaign", { campaignId, error: err });
          set({ error: String(err) });
          showNotification({
            title: "Failed to load sessions",
            message: String(err),
            color: SectionColor.Red,
          });
        } finally {
          set({ loading: false });
        }
      },

      async loadById(id) {
        set({ loading: true, error: null });
        try {

          const session = await getSessionById(id);
          set((state) => ({
            sessions: state.sessions.some((s) => s.id === id)
              ? state.sessions.map((s) => (s.id === id ? session : s))
              : [...state.sessions, session],
            selected: session,
          }));
          return session;
        } catch (err) {
          set({ error: String(err) });
          showNotification({
            title: "Failed to load session",
            message: String(err),
            color: SectionColor.Red,
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      select(id) {
        const target = id ? get().sessions.find((s) => s.id === id) ?? null : null;
        set({ selected: target });
      },

      async create(session) {
        set({ loading: true, error: null });
        try {

          const created = await createSession(session);
          set((state) => ({
            sessions: [...state.sessions, created],
            selected: created,
          }));
          showNotification({
            title: "Session created",
            message: created.name ?? created.id,
            color: SectionColor.Green,
          });
          return created;
        } catch (err) {
          set({ error: String(err) });
          showNotification({
            title: "Failed to create session",
            message: String(err),
            color: SectionColor.Red,
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      async update(session) {
        if (!session.id) return null;
        set({ loading: true, error: null });
        try {

          const updated = await updateSession(session.id, session);
          set((state) => ({
            sessions: state.sessions.map((s) => (s.id === updated.id ? updated : s)),
            selected: state.selected?.id === updated.id ? updated : state.selected,
          }));
          showNotification({
            title: "Session updated",
            message: updated.name ?? updated.id,
            color: SectionColor.Green,
          });
          return updated;
        } catch (err) {
          set({ error: String(err) });
          showNotification({
            title: "Failed to update session",
            message: String(err),
            color: SectionColor.Red,
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      async remove(id) {
        set({ loading: true, error: null });
        try {

          await deleteSession(id);
          set((state) => {
            const sessions = state.sessions.filter((s) => s.id !== id);
            const selected =
              state.selected?.id === id ? sessions[0] ?? null : state.selected;
            return { sessions, selected };
          });
          showNotification({
            title: "Session deleted",
            message: "Session removed.",
            color: SectionColor.Red,
          });
          return true;
        } catch (err) {
          set({ error: String(err) });
          showNotification({
            title: "Failed to delete session",
            message: String(err),
            color: SectionColor.Red,
          });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      clear() {
        set({ sessions: [], selected: null, loading: false, error: null });
      },

      async setLive(id: string) {
        set({ loading: true, error: null });
        try {

          const target = get().sessions.find((s) => s.id === id);
          if (!target) return;

          const updated = await updateSession(id, { ...target, isLive: true });
          const campaignId = updated.campaignId;

          set((state) => {
            const sessions = state.sessions.map((s) => {
              if (s.id === updated.id) return updated;
              if (campaignId && s.campaignId === campaignId) return { ...s, isLive: false };
              return s;
            });
            const selected =
              state.selected?.id === updated.id
                ? updated
                : campaignId && state.selected?.campaignId === campaignId
                  ? { ...state.selected!, isLive: false }
                  : state.selected;
            return { sessions, selected };
          });

          showNotification({
            title: "Session is live",
            message: updated.name ?? updated.id,
            color: SectionColor.Green,
          });
        } catch (err) {
          set({ error: String(err) });
          showNotification({
            title: "Failed to set live",
            message: String(err),
            color: SectionColor.Red,
          });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "session-storage",
      partialize: (state) => ({
        sessions: state.sessions,
        selected: state.selected,
      }),
    }
  )
);
