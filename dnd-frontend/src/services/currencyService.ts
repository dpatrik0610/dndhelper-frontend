import { apiClient } from "@api/apiClient"
import type { Currency } from "@appTypes/Currency";

const baseUrl = "/currency";

export async function getCharacterCurrencies(characterId: string): Promise<Currency[]> {
  return apiClient<Currency[]>(`${baseUrl}/${characterId}`, {})
}

export async function removeCurrencies(characterId: string, currencies: Currency[]): Promise<string> {
  return apiClient<string>(`${baseUrl}/remove/${characterId}`, {
    method: "PUT",
    body: currencies,

  })
}

export async function transferCurrenciesToCharacter(characterId: string, currencies: Currency[]): Promise<void> {  
  try {
    await apiClient<string>(`${baseUrl}/transfer/${characterId}`, {
      method: "PUT",
      body: currencies,

    });
    
    return;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export async function transferCurrenciesToInventory(
  inventoryId: string,
  currencies: Currency[]
): Promise<string> {
  return apiClient<string>(`${baseUrl}/inventory/${inventoryId}`, {
    method: "PUT",
    body: currencies,

  });
}

export async function removeCurrenciesFromInventory(inventoryId: string, currencies: Currency[]): Promise<string> {
  return apiClient<string>(`${baseUrl}/inventory/${inventoryId}/remove`, {
    method: "PUT",
    body: currencies,
  });
}

export async function transferBetweenCharacters(fromCharacterId: string, toCharacterId: string, currencies: Currency[]): Promise<void> {
  return apiClient<void>(`${baseUrl}/transfer-between/${fromCharacterId}/${toCharacterId}`, {
    method: "PUT",
    body: currencies,

  });
}

export async function claimFromInventory( characterId: string, inventoryId: string, currencies: Currency[] ): Promise<void> {
  return apiClient<void>(`${baseUrl}/claim/${characterId}/${inventoryId}`, {
    method: "PUT",
    body: currencies,

  });
}