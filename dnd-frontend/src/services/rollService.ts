import { apiClient } from "@api/apiClient";
import type { RollHistoryEntry, RollResult, RollType } from "@appTypes/Roll";

export interface SubtleRollRequest {
  characterId: string;
  expression?: string;
  numberOfDice?: number;
  sides?: number;
  note?: string;
}

/** Rolling as a character puts the roll in that character's campaign roll log. */
export async function rollByExpression(expression: string, characterId?: string | null) {
  const query = new URLSearchParams({ expression });
  if (characterId) query.set("characterId", characterId);
  return apiClient<RollResult>(`/roll?${query}`);
}

export async function subtleRoll(payload: SubtleRollRequest) {
  return apiClient<void>(`/roll/subtle`, { method: "POST", body: payload });
}

/** The current campaign's roll log (sent via X-Campaign-Id), or my own rolls when no campaign is selected. */
export async function getRollHistory(page: number, pageSize: number, type?: RollType) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (type != null) query.set("type", String(type));
  return apiClient<RollHistoryEntry[]>(`/roll/history?${query}`);
}
