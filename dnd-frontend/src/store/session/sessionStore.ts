import { create } from "zustand";
import type { Session, SessionDetails, SessionNoteInput } from "@appTypes/Session";
import {
  addSessionNote,
  createSession,
  deleteSession,
  deleteSessionNote,
  endSession,
  getSessionsByCampaign,
  startSession,
  updateSession,
  updateSessionNote,
} from "@services/sessionService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

interface SessionStore {
  campaignId: string | null;
  sessions: Session[];
  loading: boolean;

  load: (campaignId: string) => Promise<void>;
  reload: () => Promise<void>;
  create: (details?: Partial<SessionDetails>) => Promise<Session | null>;
  save: (id: string, details: SessionDetails) => Promise<Session | null>;
  start: (id: string) => Promise<Session | null>;
  end: (id: string) => Promise<Session | null>;
  remove: (id: string) => Promise<boolean>;
  addNote: (id: string, note: SessionNoteInput) => Promise<Session | null>;
  updateNote: (id: string, noteId: string, note: SessionNoteInput) => Promise<Session | null>;
  removeNote: (id: string, noteId: string) => Promise<Session | null>;
  clear: () => void;
}

const fail = (title: string, err: unknown) =>
  showNotification({ title, message: err instanceof Error ? err.message : String(err), color: SectionColor.Red });

let writes: Promise<unknown> = Promise.resolve();
const inOrder = <T,>(call: () => Promise<T>): Promise<T> => {
  const run = writes.then(call, call);
  writes = run.catch(() => undefined);
  return run;
};

export const useSessionStore = create<SessionStore>()((set, get) => {
  const put = (session: Session) => {
    if (session.campaignId !== get().campaignId) return session;
    set((state) => ({
      sessions: state.sessions.some((s) => s.id === session.id)
        ? state.sessions.map((s) => (s.id === session.id ? session : s))
        : [...state.sessions, session],
    }));
    return session;
  };

  const mutate = async (failTitle: string, call: () => Promise<Session>) => {
    try {
      return put(await inOrder(call));
    } catch (err) {
      fail(failTitle, err);
      return null;
    }
  };

  return {
    campaignId: null,
    sessions: [],
    loading: false,

    async load(campaignId) {
      if (get().campaignId !== campaignId) set({ campaignId, sessions: [] });
      set({ loading: true });
      try {
        const sessions = await getSessionsByCampaign(campaignId);
        if (get().campaignId === campaignId) set({ sessions });
      } catch (err) {
        fail("Failed to load sessions", err);
      } finally {
        set({ loading: false });
      }
    },

    async reload() {
      const { campaignId, load } = get();
      if (campaignId) await load(campaignId);
    },

    async create(details) {
      const campaignId = get().campaignId;
      if (!campaignId) return null;
      return mutate("Failed to create session", () => createSession(campaignId, details));
    },

    save: (id, details) => mutate("Failed to save session", () => updateSession(id, details)),

    async start(id) {
      const started = await mutate("Failed to start session", () => startSession(id));
      if (started) {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.status === "Live" && s.id !== id ? { ...s, status: "Completed", endedAt: started.startedAt } : s
          ),
        }));
      }
      return started;
    },

    end: (id) => mutate("Failed to end session", () => endSession(id)),

    async remove(id) {
      try {
        await inOrder(() => deleteSession(id));
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
        return true;
      } catch (err) {
        fail("Failed to delete session", err);
        return false;
      }
    },

    addNote: (id, note) => mutate("Failed to add note", () => addSessionNote(id, note)),
    updateNote: (id, noteId, note) => mutate("Failed to update note", () => updateSessionNote(id, noteId, note)),
    removeNote: (id, noteId) => mutate("Failed to delete note", () => deleteSessionNote(id, noteId)),

    clear: () => set({ campaignId: null, sessions: [], loading: false }),
  };
});
