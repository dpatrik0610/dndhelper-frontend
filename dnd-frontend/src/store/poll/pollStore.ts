import { create } from "zustand";
import type { Poll, PollInput } from "@appTypes/Poll";
import * as api from "@services/pollService";

interface PollStore {
  /** Polls of `campaignId`, newest first. */
  polls: Poll[];
  campaignId: string | null;
  loading: boolean;

  load: (campaignId: string) => Promise<void>;
  /** Refetch one poll (each member's view differs, so sync events carry no poll data). */
  refresh: (id: string) => Promise<void>;
  upsert: (poll: Poll) => void;
  removeLocal: (id: string) => void;
  clear: () => void;

  create: (input: PollInput) => Promise<Poll>;
  update: (id: string, input: PollInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  vote: (id: string, optionIds: string[]) => Promise<void>;
  retract: (id: string) => Promise<void>;
  suggest: (id: string, text: string) => Promise<void>;
  close: (id: string) => Promise<void>;
  reopen: (id: string) => Promise<void>;
  announce: (id: string) => Promise<void>;
}

export const usePollStore = create<PollStore>((set, get) => ({
  polls: [],
  campaignId: null,
  loading: false,

  load: async (campaignId) => {
    set({ loading: true, campaignId, polls: get().campaignId === campaignId ? get().polls : [] });
    try {
      const polls = await api.getCampaignPolls(campaignId);
      if (get().campaignId === campaignId) set({ polls: polls ?? [] });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async (id) => {
    try {
      get().upsert(await api.getPoll(id));
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 404 || status === 403) get().removeLocal(id);
    }
  },

  upsert: (poll) =>
    set((s) => {
      if (poll.campaignId !== s.campaignId) return s;
      return s.polls.some((p) => p.id === poll.id)
        ? { polls: s.polls.map((p) => (p.id === poll.id ? poll : p)) }
        : { polls: [poll, ...s.polls] };
    }),

  removeLocal: (id) => set((s) => ({ polls: s.polls.filter((p) => p.id !== id) })),

  clear: () => set({ polls: [], campaignId: null, loading: false }),

  create: async (input) => {
    const poll = await api.createPoll(input);
    get().upsert(poll);
    return poll;
  },
  update: async (id, input) => get().upsert(await api.updatePoll(id, input)),
  remove: async (id) => {
    await api.deletePoll(id);
    get().removeLocal(id);
  },
  vote: async (id, optionIds) => get().upsert(await api.votePoll(id, optionIds)),
  retract: async (id) => get().upsert(await api.retractPollVote(id)),
  suggest: async (id, text) => get().upsert(await api.suggestPollOption(id, text)),
  close: async (id) => get().upsert(await api.closePoll(id)),
  reopen: async (id) => get().upsert(await api.reopenPoll(id)),
  announce: async (id) => {
    await api.announcePoll(id);
  },
}));
