import { apiClient } from "../api/apiClient";
import type { Note } from "../types/Note";

const baseUrl = "/Note";

export async function getNoteById(id: string, token?: string): Promise<Note> {
  const res = await apiClient<{ data: Note }>(`${baseUrl}/${id}`, { token });
  return res.data; // unwrap
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

  return res.data; // unwrap
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

  return res.data; // unwrap
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

  return res.data; // unwrap
}

export async function deleteNote(id: string, token?: string): Promise<void> {
  await apiClient<void>(`${baseUrl}/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getNotesForCharacter(
  noteIds: string[] | null | undefined,
  token?: string
): Promise<Note[]> {
  if (!noteIds || noteIds.length === 0) return [];

  if (!Array.isArray(noteIds)) {
    console.warn("getNotesForCharacter expected array, got:", noteIds);
    return [];
  }

  const results: Note[] = [];

  for (const id of noteIds) {
    try {
      const note = await getNoteById(id, token);
      if (note && !note.isDeleted) {
        results.push(note);
      }
    } catch (err) {
      console.error(`Error loading note ${id}:`, err);
    }
  }

  return results;
}
