import { apiClient } from "../api/apiClient";
import type { Note } from "../types/Note";

const baseUrl = "/Note";

export async function getNoteById(id: string, token?: string): Promise<Note> {
  const res = await apiClient<{ data: Note }>(`${baseUrl}/${id}`, { token });
  return res.data;
}

export async function getManyNotes(
  ids: string[],
  token?: string
): Promise<Note[]> {
  if (!Array.isArray(ids)) {
    console.error("getManyNotes expected array, got:", ids);
    ids = [ids];
  }

  const params = ids.join(",");
  const res = await apiClient<{ data: Note[] }>(
    `${baseUrl}/many?ids=${params}`,
    { token }
  );

  return res.data;
}

export async function createNote(
  note: Partial<Note>,
  token?: string
): Promise<Note> {
  const res = await apiClient<{ data: Note }>(`${baseUrl}`, {
    method: "POST",
    body: note,
    token,
  });

  return res.data;
}

export async function updateNote(
  id: string,
  note: Partial<Note>,
  token?: string
): Promise<Note> {
  const res = await apiClient<{ data: Note }>(`${baseUrl}/${id}`, {
    method: "PUT",
    body: note,
    token,
  });

  return res.data;
}

export async function deleteNote(id: string, token?: string): Promise<void> {
  await apiClient<void>(`${baseUrl}/${id}`, {
    method: "DELETE",
    token,
  });
}