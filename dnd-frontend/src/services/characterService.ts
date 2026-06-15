import type { Character } from "../types/Character/Character";
import { apiClient } from "../api/apiClient";

export interface ApiResponse {
  message?: string;
}


  


export async function getCharacters(): Promise<Character[]> {
  

  const response = await apiClient<Character[] | Character>("/character", { method: "GET" });
  return Array.isArray(response) ? response : [response];
}

export async function getOwnCharacters(): Promise<Character[]> {
  

  const response = await apiClient<Character[] | Character>("/character/own", { method: "GET" });
  return Array.isArray(response) ? response : [response];
}

export async function getCharacterById(characterId: string): Promise<Character | null> {
  

  try {
    return await apiClient<Character>(`/character/${characterId}`, { method: "GET" });
  } catch (error) {
    console.error("Failed to fetch character:", error);
    return null;
  }
}

export async function createCharacter(character: Character): Promise<Character | null> {
  

  try {
    return await apiClient<Character>("/character", {
      method: "POST",
      body: character,

    });
  } catch (error) {
    console.error("Character creation failed:", error);
    return null;
  }
}

export async function updateCharacter(character: Character): Promise<Character | null> {
  

  if (!character.id) throw new Error("Character ID is required for update");

  try {
    return await apiClient<Character>(`/character/${character.id}`, {
      method: "PUT",
      body: character,

    });
  } catch (error) {
    console.error("Character update failed:", error);
    return null;
  }
}

export async function deleteCharacter(characterId: string): Promise<boolean> {
  

  try {
    await apiClient<void>(`/character/${characterId}`, { method: "DELETE" });
    return true;
  } catch (error) {
    console.error("Character deletion failed:", error);
    return false;
  }
}

export async function useSpellSlot(characterId: string, level: number): Promise<{ success: boolean; message: string }> {
  

  try {
    await apiClient<void>(`/character/${characterId}/spellslots/use/${level}`, {
      method: "POST",

    });
    return { success: true, message: `Used a level ${level} spell slot.` };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to use spell slot." };
  }
}

export async function recoverSpellSlot(characterId: string, level: number, amount: number = 1): Promise<{ success: boolean; message: string }> {
  

  try {
    await apiClient<void>(`/character/${characterId}/spellslots/recover/${level}?amount=${amount}`, {
      method: "POST",

    });
    return { success: true, message: `Recovered ${amount} level ${level} spell slot(s).` };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to recover spell slot." };
  }
}

export async function longrest(characterId: string): Promise<{ success: boolean; message: string }> {
  

  try {
    const response = await apiClient<ApiResponse>(`/character/${characterId}/longrest`, {
      method: "POST",

    });
    return { success: true, message: response.message || "You slept through the night :)" };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to perform long rest." };
  }
}

export async function bulkLongRest(characterIds: string[]): Promise<{ successful: string[], failed: string[] }> {
  

  try {
    const response = await apiClient<{ successful: string[], failed: string[] }>('/character/bulk-long-rest', {
      method: 'POST',
      body: characterIds,

    });
    return response;
  } catch (error) {
    console.error("Bulk long rest failed:", error);
    return { successful: [], failed: characterIds };
  }
}
