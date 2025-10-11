import type { Character } from "../types/Character/Character";
import { apiClient } from "../api/apiClient";

export async function getCharacters(token: string): Promise<Character[]> {
  if (!token) throw new Error("Token is required to fetch characters");

  const response = await apiClient<Character | Character[]>("/character", { method: "GET", token });

  if (!response) return [];
  return Array.isArray(response) ? response : [response];
}