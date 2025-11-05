import { apiClient } from "../api/apiClient"
import type { Campaign } from "../types/Campaign"
import type { Character } from "../types/Character/Character"

// ----------- Base CRUD -----------
export async function getAllCampaigns(token: string): Promise<Campaign[]> {
  return apiClient<Campaign[]>("/Campaign", { token })
}

export async function getCampaignById(id: string, token: string): Promise<Campaign> {
  return apiClient<Campaign>(`/Campaign/${id}`, { token })
}

export async function createCampaign(campaign: Campaign, token: string): Promise<Campaign> {
  return apiClient<Campaign>("/Campaign/create", { method: "POST", body: campaign, token})
}

export async function updateCampaign(id: string, campaign: Campaign, token: string): Promise<Campaign> {
  return apiClient<Campaign>(`/Campaign/${id}`, { method: "PUT", body: campaign, token })
}

export async function deleteCampaign(id: string, token: string): Promise<void> {
  return apiClient<void>(`/Campaign/${id}`, { method: "DELETE", token })
}

// ----------- Characters -----------
export async function getCampaignCharacters(id: string, token: string): Promise<Character[]> {
  return apiClient(`/Campaign/${id}/characters`, { token })
}

export async function addCharacterToCampaign(id: string, characterId: string, token: string): Promise<void> {
  return apiClient(`/Campaign/${id}/characters/${characterId}`, { method: "POST", token })
}

export async function removeCharacterFromCampaign(id: string, characterId: string, token: string): Promise<void> {
  return apiClient(`/Campaign/${id}/characters/${characterId}`, { method: "DELETE", token })
}

// ----------- Worlds -----------
export async function addWorldToCampaign(id: string, worldId: string, token: string) {
  return apiClient(`/Campaign/${id}/worlds/${worldId}`, { method: "POST", token })
}

export async function removeWorldFromCampaign(id: string, worldId: string, token: string) {
  return apiClient(`/Campaign/${id}/worlds/${worldId}`, { method: "DELETE", token })
}

// ----------- Quests -----------
export async function addQuestToCampaign(id: string, questId: string, token: string) {
  return apiClient(`/Campaign/${id}/quests/${questId}`, { method: "POST", token })
}

export async function removeQuestFromCampaign(id: string, questId: string, token: string) {
  return apiClient(`/Campaign/${id}/quests/${questId}`, { method: "DELETE", token })
}

// ----------- Notes -----------
export async function addNoteToCampaign(id: string, noteId: string, token: string) {
  return apiClient(`/Campaign/${id}/notes/${noteId}`, { method: "POST", token })
}

export async function removeNoteFromCampaign(id: string, noteId: string, token: string) {
  return apiClient(`/Campaign/${id}/notes/${noteId}`, { method: "DELETE", token })
}

// ----------- Sessions -----------
export async function addSessionToCampaign(id: string, sessionId: string, token: string) {
  return apiClient(`/Campaign/${id}/sessions/${sessionId}`, { method: "POST", token })
}

export async function removeSessionFromCampaign(id: string, sessionId: string, token: string) {
  return apiClient(`/Campaign/${id}/sessions/${sessionId}`, { method: "DELETE", token })
}

export async function setCurrentSessionForCampaign(id: string, sessionId: string, token: string) {
  return apiClient(`/Campaign/${id}/current-session/${sessionId}`, { method: "PUT", token })
}
