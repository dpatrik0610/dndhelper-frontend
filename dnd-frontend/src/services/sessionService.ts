import { apiClient } from "../api/apiClient";
import type { Session } from "../types/Session";

const baseUrl = "/Session";

export async function getAllSessions(): Promise<Session[]> {
  return apiClient(baseUrl, { method: "GET" });
}

export async function getSessionById(id: string): Promise<Session> {
  return apiClient(`${baseUrl}/${id}`, { method: "GET" });
}

export async function getSessionsByCampaign(campaignId: string): Promise<Session[]> {
  return apiClient(`${baseUrl}/campaign/${campaignId}`, { method: "GET" });
}

export async function createSession(session: Session): Promise<Session> {
  return apiClient(baseUrl, {
    method: "POST",

    body: session,
  });
}

export async function updateSession(id: string, session: Session): Promise<Session> {
  return apiClient(`${baseUrl}/${id}`, {
    method: "PUT",

    body: session,
  });
}

export async function deleteSession(id: string): Promise<void> {
  return apiClient(`${baseUrl}/${id}`, { method: "DELETE" });
}
