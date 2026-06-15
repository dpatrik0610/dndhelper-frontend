import { apiClient } from "../api/apiClient";
import type { Note } from "../types/Note";

const baseUrl = "/Note";

export async function getNoteById(id: string): Promise<Note> {
  const res = await apiClient<{ data: Note }>(`${baseUrl}/${id}`, {});
  return res.data;
}

export async function getManyNotes(
  ids: string[]
): Promise<Note[]> {
  if (!Array.isArray(ids)) {
    console.error("getManyNotes expected array, got:", ids);
    ids = [ids];
  }

  const params = ids.join(",");
  const res = await apiClient<{ data: Note[] }>(
    `${baseUrl}/many?ids=${params}`,
    {}
  );

  return res.data;
}

export async function createNote(
  note: Partial<Note>
): Promise<Note> {
  const res = await apiClient<{ data: Note }>(`${baseUrl}`, {
    method: "POST",
    body: note,

  });

  return res.data;
}

export async function updateNote(
  id: string,
  note: Partial<Note>
): Promise<Note> {
  const res = await apiClient<{ data: Note }>(`${baseUrl}/${id}`, {
    method: "PUT",
    body: note,

  });

  return res.data;
}

export async function deleteNote(id: string): Promise<void> {
  await apiClient<void>(`${baseUrl}/${id}`, {
    method: "DELETE",

  });
}