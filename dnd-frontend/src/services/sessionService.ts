import { apiClient } from "../api/apiClient";
import type { Session } from "../types/Session";

const baseUrl = "/Session";

export async function getAllSessions(token: string): Promise<Session[]> {
  return apiClient(baseUrl, { method: "GET", token });
}

export async function getSessionById(id: string, token: string): Promise<Session> {
  return apiClient(`${baseUrl}/${id}`, { method: "GET", token });
}

export async function getSessionsByCampaign(campaignId: string, token: string): Promise<Session[]> {
  return apiClient(`${baseUrl}/campaign/${campaignId}`, { method: "GET", token });
}

export async function createSession(session: Session, token: string): Promise<Session> {
  return apiClient(baseUrl, {
    method: "POST",
    token,
    body: session,
  });
}

export async function updateSession(id: string, session: Session, token: string): Promise<Session> {
  return apiClient(`${baseUrl}/${id}`, {
    method: "PUT",
    token,
    body: session,
  });
}

export async function deleteSession(id: string, token: string): Promise<void> {
  return apiClient(`${baseUrl}/${id}`, { method: "DELETE", token });
}
