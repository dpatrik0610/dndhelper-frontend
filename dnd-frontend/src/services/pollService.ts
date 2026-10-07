import { apiClient } from "@api/apiClient";
import type { Poll, PollInput } from "@appTypes/Poll";

const baseUrl = "/poll";

export const getCampaignPolls = (campaignId: string) => apiClient<Poll[]>(`${baseUrl}/campaign/${campaignId}`);

export const getPoll = (id: string) => apiClient<Poll>(`${baseUrl}/${id}`);

export const createPoll = (input: PollInput) => apiClient<Poll>(baseUrl, { method: "POST", body: input });

export const updatePoll = (id: string, input: PollInput) =>
  apiClient<Poll>(`${baseUrl}/${id}`, { method: "PUT", body: input });

export const deletePoll = (id: string) => apiClient<void>(`${baseUrl}/${id}`, { method: "DELETE" });

export const votePoll = (id: string, optionIds: string[]) =>
  apiClient<Poll>(`${baseUrl}/${id}/vote`, { method: "POST", body: { optionIds } });

export const retractPollVote = (id: string) => apiClient<Poll>(`${baseUrl}/${id}/vote`, { method: "DELETE" });

export const suggestPollOption = (id: string, text: string) =>
  apiClient<Poll>(`${baseUrl}/${id}/options`, { method: "POST", body: { text } });

export const closePoll = (id: string) => apiClient<Poll>(`${baseUrl}/${id}/close`, { method: "POST" });

export const reopenPoll = (id: string) => apiClient<Poll>(`${baseUrl}/${id}/reopen`, { method: "POST" });

export const announcePoll = (id: string) => apiClient<void>(`${baseUrl}/${id}/announce`, { method: "POST" });
