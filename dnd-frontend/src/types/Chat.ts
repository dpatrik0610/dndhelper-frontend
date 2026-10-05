/** One line of a campaign's chat (server: ChatMessage). */
export interface ChatMessage {
  id: string;
  campaignId: string;
  userId: string;
  /** The character speaking; null = the user themselves. */
  characterId: string | null;
  /** Character name, or the user name. Captured when sent. */
  name: string;
  isDm: boolean;
  text: string;
  /** Only the sender, the DMs and the target character's owners see it. */
  whisper: boolean;
  /** A DM's whisper target; null on a player's whisper, which goes to the DMs. */
  /** A DM's whisper target; null on a player's whisper, which goes to the DMs. */
  toCharacterId: string | null;
  toName: string | null;
  editedAt: string | null;
  createdAt: string;
}

/** Messages oldest first, and whether older ones exist. */
export interface ChatPage {
  messages: ChatMessage[];
  hasMore: boolean;
}

export interface ChatSendRequest {
  text: string;
  characterId: string | null;
  whisper: boolean;
  /** DM whispers only. */
  toCharacterId: string | null;
}

/** A campaign the user can chat in. */
export interface ChatCampaign {
  id: string;
  name: string;
  isDm: boolean;
}

/** A player character the DM can whisper to; all its owners read the whisper. */
export interface ChatTarget {
  characterId: string;
  name: string;
}

/** A character the user can speak as. */
export interface ChatSpeaker {
  id: string;
  name: string;
}

/** What the server sends when a campaign's chat is opened. */
export interface ChatRoom {
  campaignId: string;
  campaignName: string;
  isDm: boolean;
  page: ChatPage;
  whisperTargets: ChatTarget[];
  characters: ChatSpeaker[];
  /** Character id → portrait URL, for the campaign characters that have one. */
  avatars: Record<string, string>;
}
