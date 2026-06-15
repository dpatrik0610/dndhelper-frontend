import { apiClient } from "@api/apiClient"
import type { Campaign } from "@appTypes/Campaign"
import type { Character } from "@appTypes/Character/Character"
import type { CampaignOverviewDto } from "@appTypes/CampaignOverview"

// ----------- Base CRUD -----------
export async function getAllCampaigns(): Promise<Campaign[]> {
  return apiClient<Campaign[]>("/Campaign", {})
}

export async function getCampaignById(id: string): Promise<Campaign> {
  return apiClient<Campaign>(`/Campaign/${id}`, {})
}

export async function getCampaignBasicById(id: string): Promise<Pick<Campaign, "id" | "name" | "description" | "isActive" | "currentSessionId" | "sessionIds" | "ownerIds">> {
  return apiClient(`/Campaign/${id}/basic`, {});
}

export async function getCampaignOverviewByCharacter(characterId: string): Promise<CampaignOverviewDto | null> {
  try {
    return await apiClient(`/campaign/character/${characterId}/overview`, {});
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 404) return null;
    throw err;
  }
}

export async function createCampaign(campaign: Campaign): Promise<Campaign> {
  return apiClient<Campaign>("/Campaign/create", { method: "POST", body: campaign })
}

export async function updateCampaign(id: string, campaign: Campaign): Promise<Campaign> {
  return apiClient<Campaign>(`/Campaign/${id}`, { method: "PUT", body: campaign })
}

export async function deleteCampaign(id: string): Promise<void> {
  return apiClient<void>(`/Campaign/${id}`, { method: "DELETE" })
}

// ----------- Characters -----------
export async function getCampaignCharacters(id: string): Promise<Character[]> {
  return apiClient(`/Campaign/${id}/characters`, {})
}

export async function addCharacterToCampaign(id: string, characterId: string): Promise<void> {
  return apiClient(`/Campaign/${id}/characters/${characterId}`, { method: "POST" })
}

export async function removeCharacterFromCampaign(id: string, characterId: string): Promise<void> {
  return apiClient(`/Campaign/${id}/characters/${characterId}`, { method: "DELETE" })
}

// ----------- Worlds -----------
export async function addWorldToCampaign(id: string, worldId: string) {
  return apiClient(`/Campaign/${id}/worlds/${worldId}`, { method: "POST" })
}

export async function removeWorldFromCampaign(id: string, worldId: string) {
  return apiClient(`/Campaign/${id}/worlds/${worldId}`, { method: "DELETE" })
}

// ----------- Quests -----------
export async function addQuestToCampaign(id: string, questId: string) {
  return apiClient(`/Campaign/${id}/quests/${questId}`, { method: "POST" })
}

export async function removeQuestFromCampaign(id: string, questId: string) {
  return apiClient(`/Campaign/${id}/quests/${questId}`, { method: "DELETE" })
}

// ----------- Notes -----------
export async function addNoteToCampaign(id: string, noteId: string) {
  return apiClient(`/Campaign/${id}/notes/${noteId}`, { method: "POST" })
}

export async function removeNoteFromCampaign(id: string, noteId: string) {
  return apiClient(`/Campaign/${id}/notes/${noteId}`, { method: "DELETE" })
}

// ----------- Sessions -----------
export async function addSessionToCampaign(id: string, sessionId: string) {
  return apiClient(`/Campaign/${id}/sessions/${sessionId}`, { method: "POST" })
}

export async function removeSessionFromCampaign(id: string, sessionId: string) {
  return apiClient(`/Campaign/${id}/sessions/${sessionId}`, { method: "DELETE" })
}

export async function setCurrentSessionForCampaign(id: string, sessionId: string) {
  return apiClient(`/Campaign/${id}/current-session/${sessionId}`, { method: "PUT" })
}

export async function setActiveEncounterForCampaign(campaignId: string, encounterId: string) {
  return apiClient(`/Campaign/${campaignId}/active-encounter/${encounterId}`, { method: "PUT" })
}

export async function clearActiveEncounterForCampaign(campaignId: string) {
  return apiClient(`/Campaign/${campaignId}/active-encounter`, { method: "DELETE" })
}
