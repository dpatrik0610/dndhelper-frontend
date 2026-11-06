import { apiClient } from "@api/apiClient";
import type {
  ChronicleComment,
  ChronicleEntry,
  ChronicleEntryInput,
  ChronicleFolder,
  ChronicleFolderInput,
} from "@appTypes/Chronicle";

const baseUrl = "/chronicle";

export const getCampaignEntries = (campaignId: string) => apiClient<ChronicleEntry[]>(`${baseUrl}/campaign/${campaignId}`);

export const getEntry = (id: string) => apiClient<ChronicleEntry>(`${baseUrl}/${id}`);

export const createEntry = (input: ChronicleEntryInput) => apiClient<ChronicleEntry>(baseUrl, { method: "POST", body: input });

export const updateEntry = (id: string, input: ChronicleEntryInput) =>
  apiClient<ChronicleEntry>(`${baseUrl}/${id}`, { method: "PUT", body: input });

export const deleteEntry = (id: string) => apiClient<void>(`${baseUrl}/${id}`, { method: "DELETE" });

export const getCampaignFolders = (campaignId: string) =>
  apiClient<ChronicleFolder[]>(`${baseUrl}/campaign/${campaignId}/folders`);

export const createFolder = (input: ChronicleFolderInput) =>
  apiClient<ChronicleFolder>(`${baseUrl}/folders`, { method: "POST", body: input });

export const updateFolder = (id: string, input: ChronicleFolderInput) =>
  apiClient<ChronicleFolder>(`${baseUrl}/folders/${id}`, { method: "PUT", body: input });

export const deleteFolder = (id: string) => apiClient<void>(`${baseUrl}/folders/${id}`, { method: "DELETE" });

export const getComments = (entryId: string) => apiClient<ChronicleComment[]>(`${baseUrl}/${entryId}/comments`);

export const addComment = (entryId: string, text: string) =>
  apiClient<ChronicleComment>(`${baseUrl}/${entryId}/comments`, { method: "POST", body: { text } });

export const deleteComment = (entryId: string, commentId: string) =>
  apiClient<void>(`${baseUrl}/${entryId}/comments/${commentId}`, { method: "DELETE" });

/** Max 3 MB, images only (checked again by the server). Returns the public URL. */
export async function uploadChronicleImage(campaignId: string, file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  return (await apiClient<{ url: string }>(`${baseUrl}/campaign/${campaignId}/images`, { method: "POST", body })).url;
}
