import type { Character } from "../types/Character/Character";
import { apiClient } from "../api/apiClient";

export interface ApiResponse {
  message?: string;
}

export async function getCharacters(token: string): Promise<Character[]> {
  checkToken(token);

  const response = await apiClient<Character | Character[]>("/character", { method: "GET", token });

  if (!response) return [];
  return Array.isArray(response) ? response : [response];
}

export async function longrest(characterId: string, token: string): Promise<{success: boolean, message: string}> {
  checkToken(token);

  try {
    const response = await apiClient<ApiResponse>(`/character/${characterId}/longrest`, {
      method: "POST",
      token,
    });

    return {
      success: true,
      message: response.message || "You slept through the night :)"
    }
  }
  catch (error) {
    return {
      success: false,
      message: (error as Error).message || "Failed to perform longrest."
    }
  }
}


function checkToken(token: string) {
  if (!token) throw new Error("Token is required to fetch characters");
}