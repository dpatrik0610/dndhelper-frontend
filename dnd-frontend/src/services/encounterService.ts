import { apiClient } from "@api/apiClient";
import type { Encounter } from "@appTypes/Encounter";

const baseUrl = "/Encounter";

export async function getAllEncounters(): Promise<Encounter[]> {
  return apiClient(baseUrl, { method: "GET" });
}

export async function getEncounterById(id: string): Promise<Encounter> {
  return apiClient(`${baseUrl}/${id}`, { method: "GET" });
}

export async function getEncountersByCampaign(campaignId: string): Promise<Encounter[]> {
  return apiClient(`${baseUrl}/campaign/${campaignId}`, { method: "GET" });
}

export async function getEncountersBySession(sessionId: string): Promise<Encounter[]> {
  return apiClient(`${baseUrl}/session/${sessionId}`, { method: "GET" });
}

export async function createEncounter(encounter: Encounter): Promise<Encounter> {
  return apiClient(baseUrl, {
    method: "POST",

    body: encounter,
  });
}

export async function updateEncounter(id: string, encounter: Encounter): Promise<Encounter> {
  return apiClient(`${baseUrl}/${id}`, {
    method: "PUT",

    body: encounter,
  });
}

export async function deleteEncounter(id: string): Promise<void> {
  return apiClient(`${baseUrl}/${id}`, { method: "DELETE" });
}
