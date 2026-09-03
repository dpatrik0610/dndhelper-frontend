import { apiClient } from "@api/apiClient";
import type { Quest, QuestObjective } from "@appTypes/Quest";

const baseUrl = "/quest";

export async function getQuestById(id: string): Promise<Quest> {
  const res = await apiClient<{ data: Quest }>(`${baseUrl}/${id}`, {
    method: "GET",
  });
  return res.data;
}

export async function getCampaignQuests(campaignId: string): Promise<Quest[]> {
  const res = await apiClient<{ data: Quest[] }>(`${baseUrl}/campaign/${campaignId}`, {
    method: "GET",
  });
  return res.data || [];
}

export async function createQuest(quest: Partial<Quest>): Promise<Quest> {
  const res = await apiClient<{ data: Quest }>(`${baseUrl}`, {
    method: "POST",
    body: quest,
  });
  return res.data;
}

export async function updateQuest(id: string, quest: Partial<Quest>): Promise<Quest> {
  const res = await apiClient<{ data: Quest }>(`${baseUrl}/${id}`, {
    method: "PUT",
    body: quest,
  });
  return res.data;
}

export async function deleteQuest(id: string): Promise<void> {
  await apiClient<void>(`${baseUrl}/${id}`, {
    method: "DELETE",
  });
}

// Atomic Objective Management
export async function addObjective(
  questId: string,
  objective: {
    description?: string;
    currentProgress: number;
    completionThreshold: number;
  }
): Promise<Quest> {
  const res = await apiClient<{ data: Quest }>(`${baseUrl}/${questId}/objective`, {
    method: "POST",
    body: objective,
  });
  return res.data;
}

export async function updateObjective(
  questId: string,
  objective: QuestObjective
): Promise<Quest> {
  const res = await apiClient<{ data: Quest }>(`${baseUrl}/${questId}/objective`, {
    method: "PUT",
    body: objective,
  });
  return res.data;
}

export async function deleteObjective(
  questId: string,
  objectiveId: string
): Promise<Quest> {
  const res = await apiClient<{ data: Quest }>(`${baseUrl}/${questId}/objective/${objectiveId}`, {
    method: "DELETE",
  });
  return res.data;
}
