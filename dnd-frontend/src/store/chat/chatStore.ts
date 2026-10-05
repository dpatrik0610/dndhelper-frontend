import { create } from "zustand";
import type { ChatCampaign, ChatMessage, ChatRoom } from "@appTypes/Chat";

/** The open campaign chat of this tab (one at a time), fed by useChatHub. */
interface ChatState {
  connected: boolean;
  /** Campaigns the user can chat in; null until loaded. */
  campaigns: ChatCampaign[] | null;
  /** The open campaign, without its messages. */
  room: Omit<ChatRoom, "page"> | null;
  messages: ChatMessage[];
  /** Older messages exist on the server. */
  hasMore: boolean;
  /** Why the chat couldn't open, if it couldn't. */
  error: string | null;
  /** Someone else wrote while no chat view was on screen. */
  unread: boolean;
  /** How many chat views are on screen (and so read). */
  viewers: number;
}

interface ChatActions {
  opened: (room: ChatRoom) => void;
  add: (message: ChatMessage, mine: boolean) => void;
  update: (message: ChatMessage) => void;
  remove: (messageId: string) => void;
  prepend: (older: ChatMessage[], hasMore: boolean) => void;
  set: (partial: Partial<ChatState>) => void;
  reset: () => void;
}

const initial: ChatState = {
  connected: false,
  campaigns: null,
  room: null,
  messages: [],
  hasMore: false,
  error: null,
  unread: false,
  viewers: 0,
};

export const useChatStore = create<ChatState & ChatActions>()((set) => ({
  ...initial,

  opened: ({ page, ...room }) => set({ room, messages: page.messages, hasMore: page.hasMore, error: null }),
  // Whispers can arrive twice (through the DM group and the user group): keep one.
  add: (message, mine) =>
    set((s) =>
      s.messages.some((m) => m.id === message.id)
        ? s
        : { messages: [...s.messages, message], unread: s.unread || (!mine && s.viewers === 0) }
    ),
  update: (message) => set((s) => ({ messages: s.messages.map((m) => (m.id === message.id ? message : m)) })),
  remove: (messageId) => set((s) => ({ messages: s.messages.filter((m) => m.id !== messageId) })),
  prepend: (older, hasMore) => set((s) => ({ messages: [...older, ...s.messages], hasMore })),
  set: (partial) => set(partial),
  reset: () => set((s) => ({ ...initial, viewers: s.viewers })),
}));
