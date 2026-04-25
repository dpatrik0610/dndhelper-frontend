import { apiClient } from "@api/apiClient";
import type { Encounter } from "@appTypes/Encounter";

const baseUrl = "/Encounter";

export async function getAllEncounters(token: string): Promise<Encounter[]> {
  return apiClient(baseUrl, { method: "GET", token });
}

export async function getEncounterById(id: string, token: string): Promise<Encounter> {
  return apiClient(`${baseUrl}/${id}`, { method: "GET", token });
}

export async function getEncountersByCampaign(campaignId: string, token: string): Promise<Encounter[]> {
  return apiClient(`${baseUrl}/campaign/${campaignId}`, { method: "GET", token });
}

export async function getEncountersBySession(sessionId: string, token: string): Promise<Encounter[]> {
  return apiClient(`${baseUrl}/session/${sessionId}`, { method: "GET", token });
}

export async function createEncounter(encounter: Encounter, token: string): Promise<Encounter> {
  return apiClient(baseUrl, {
    method: "POST",
    token,
    body: encounter,
  });
}

export async function updateEncounter(id: string, encounter: Encounter, token: string): Promise<Encounter> {
  return apiClient(`${baseUrl}/${id}`, {
    method: "PUT",
    token,
    body: encounter,
  });
}

export async function deleteEncounter(id: string, token: string): Promise<void> {
  return apiClient(`${baseUrl}/${id}`, { method: "DELETE", token });
}
