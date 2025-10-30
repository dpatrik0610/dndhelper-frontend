import type { Character } from "../types/Character/Character";
import { apiClient } from "../api/apiClient";

export interface ApiResponse {
  message?: string;
}

function checkToken(token: string) {
  if (!token) throw new Error("Token is required for this request");
}

export async function getCharacters(token: string): Promise<Character[]> {
  checkToken(token);

  const response = await apiClient<Character[] | Character>("/character", { method: "GET", token });
  return Array.isArray(response) ? response : [response];
}

export async function getOwnCharacters(token: string): Promise<Character[]> {
  checkToken(token);

  const response = await apiClient<Character[] | Character>("/character/own", { method: "GET", token });
  return Array.isArray(response) ? response : [response];
}

export async function getCharacterById(characterId: string, token: string): Promise<Character | null> {
  checkToken(token);

  try {
    return await apiClient<Character>(`/character/${characterId}`, { method: "GET", token });
  } catch (error) {
    console.error("Failed to fetch character:", error);
    return null;
  }
}

export async function createCharacter(character: Character, token: string): Promise<Character | null> {
  checkToken(token);

  try {
    return await apiClient<Character>("/character", {
      method: "POST",
      body: character,
      token,
    });
  } catch (error) {
    console.error("Character creation failed:", error);
    return null;
  }
}

export async function updateCharacter(character: Character, token: string): Promise<Character | null> {
  checkToken(token);

  if (!character.id) throw new Error("Character ID is required for update");

  try {
    return await apiClient<Character>(`/character/${character.id}`, {
      method: "PUT",
      body: character,
      token,
    });
  } catch (error) {
    console.error("Character update failed:", error);
    return null;
  }
}

export async function deleteCharacter(characterId: string, token: string): Promise<boolean> {
  checkToken(token);

  try {
    await apiClient<void>(`/character/${characterId}`, { method: "DELETE", token });
    return true;
  } catch (error) {
    console.error("Character deletion failed:", error);
    return false;
  }
}

export async function useSpellSlot(characterId: string, level: number, token: string): Promise<{ success: boolean; message: string }> {
  checkToken(token);

  try {
    await apiClient<void>(`/character/${characterId}/spellslots/use/${level}`, {
      method: "POST",
      token,
    });
    return { success: true, message: `Used a level ${level} spell slot.` };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to use spell slot." };
  }
}

export async function recoverSpellSlot(characterId: string, level: number, token: string, amount: number = 1): Promise<{ success: boolean; message: string }> {
  checkToken(token);

  try {
    await apiClient<void>(`/character/${characterId}/spellslots/recover/${level}?amount=${amount}`, {
      method: "POST",
      token,
    });
    return { success: true, message: `Recovered ${amount} level ${level} spell slot(s).` };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to recover spell slot." };
  }
}

export async function longrest(characterId: string, token: string): Promise<{ success: boolean; message: string }> {
  checkToken(token);

  try {
    const response = await apiClient<ApiResponse>(`/character/${characterId}/longrest`, {
      method: "POST",
      token,
    });
    return { success: true, message: response.message || "You slept through the night :)" };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to perform long rest." };
  }
}
