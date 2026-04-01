import { apiClient } from "@api/apiClient";
import type { RollResult } from "@appTypes/Roll";

export interface SubtleRollRequest {
  characterId: string;
  expression?: string;
  numberOfDice?: number;
  sides?: number;
  note?: string;
}

export async function rollByExpression(expression: string, token?: string | null) {
  return apiClient<RollResult>(`/roll?expression=${encodeURIComponent(expression)}`, {
    token: token ?? undefined,
  });
}

export async function rollByDice(numberOfDice: number, sides: number, token?: string | null) {
  return apiClient<RollResult>(`/roll/${numberOfDice}d${sides}`, {
    token: token ?? undefined,
  });
}

export async function subtleRoll(payload: SubtleRollRequest, token?: string | null) {
  return apiClient<void>(`/roll/subtle`, {
    method: "POST",
    body: payload,
    token: token ?? undefined,
  });
}
