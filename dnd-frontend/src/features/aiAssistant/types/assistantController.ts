import type {
  AssistantConfig,
  AssistantMessage,
  AssistantTopic,
} from "@features/aiAssistant/types";

export type AssistantController = {
  config: AssistantConfig;
  draftConfig: AssistantConfig;
  activeMessages: AssistantMessage[];
  activeTopic: AssistantTopic | null;

  messageInput: string;
  isSending: boolean;
  settingsOpen: boolean;

  isMobile: boolean;

  // setters
  setDraftConfig: (value: AssistantConfig) => void;
  setMessageInput: (value: string) => void;
  setActiveTopicId: (id: string) => void;
  setSettingsOpen: (value: boolean | ((v: boolean) => boolean)) => void;

  // actions
  send: () => Promise<void>;
  clear: () => void;
  abort: () => void;

  save: () => void;
  resetConfig: () => void;

  downloadChat: () => void;

  // refs
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};