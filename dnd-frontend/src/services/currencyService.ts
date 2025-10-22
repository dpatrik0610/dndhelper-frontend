import { apiClient } from "../api/apiClient"

export interface Currency {
  type: string
  amount: number
  currencyCode?: string
}

const baseUrl = "/currency";

// GET: /api/currency/{characterId}
export async function getCharacterCurrencies(characterId: string, token?: string): Promise<Currency[]> {
  return apiClient<Currency[]>(`${baseUrl}/${characterId}`, { token })
}

// PUT: /api/currency/remove/{characterId}
export async function removeCurrencies(characterId: string, currencies: Currency[], token?: string): Promise<string> {
  return apiClient<string>(`${baseUrl}/remove/${characterId}`, {
    method: "PUT",
    body: currencies,
    token,
  })
}

// PUT: /api/currency/transfer/{targetId}
export async function transferCurrenciesToCharacter(characterId: string, currencies: Currency[], token?: string): Promise<void> {  
  try {
    const response = await apiClient<string>(`${baseUrl}/transfer/${characterId}`, {
      method: "PUT",
      body: currencies,
      token,
    });
    
    console.log('API call successful, response:', response);
    return;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}