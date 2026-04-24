import type { ChatSession } from "@features/aiAssistant/types/chatSession";

const KEY = "ai-chat-sessions";

export function loadSessions(): ChatSession[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(KEY, JSON.stringify(sessions));
}