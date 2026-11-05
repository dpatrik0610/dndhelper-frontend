import { apiClient } from "@api/apiClient";
import type { Session, SessionDetails, SessionNoteInput } from "@appTypes/Session";

const baseUrl = "/Session";

export const getSessionsByCampaign = (campaignId: string) =>
  apiClient<Session[]>(`${baseUrl}/campaign/${campaignId}`);

export const createSession = (campaignId: string, details: Partial<SessionDetails> = {}) =>
  apiClient<Session>(baseUrl, { method: "POST", body: { ...details, campaignId } });

export const updateSession = (id: string, details: SessionDetails) =>
  apiClient<Session>(`${baseUrl}/${id}`, { method: "PUT", body: details });

export const startSession = (id: string) => apiClient<Session>(`${baseUrl}/${id}/start`, { method: "POST" });

export const endSession = (id: string) => apiClient<Session>(`${baseUrl}/${id}/end`, { method: "POST" });

export const deleteSession = (id: string) => apiClient<void>(`${baseUrl}/${id}`, { method: "DELETE" });

export const addSessionNote = (id: string, note: SessionNoteInput) =>
  apiClient<Session>(`${baseUrl}/${id}/notes`, { method: "POST", body: note });

export const updateSessionNote = (id: string, noteId: string, note: SessionNoteInput) =>
  apiClient<Session>(`${baseUrl}/${id}/notes/${noteId}`, { method: "PUT", body: note });

export const deleteSessionNote = (id: string, noteId: string) =>
  apiClient<Session>(`${baseUrl}/${id}/notes/${noteId}`, { method: "DELETE" });
