import { apiClient } from "@api/apiClient";
import type { RollHistoryEntry, RollResult } from "@appTypes/Roll";

export interface SubtleRollRequest {
  characterId: string;
  expression?: string;
  numberOfDice?: number;
  sides?: number;
  note?: string;
}

export interface RollHistoryParams {
  page: number;
  pageSize: number;
  campaignId?: string;
}

export async function rollByExpression(expression: string | null) {
  return apiClient<RollResult>(`/roll?expression=${encodeURIComponent(expression ?? "")}`, { method: "GET" });
}

export async function rollByDice(numberOfDice: number, sides: number | null) {
  return apiClient<RollResult>(`/roll/${numberOfDice}d${sides}`, {

  });
}

export async function subtleRoll(payload: SubtleRollRequest | null) {
  return apiClient<void>(`/roll/subtle`, {
    method: "POST",
    body: payload,

  });
}

export async function getRollHistory(params: RollHistoryParams | null) {
  const query = new URLSearchParams({
    page: (params?.page || 1).toString(),
    pageSize: (params?.pageSize || 20).toString(),
  });

  if (params?.campaignId) {
    query.set("campaignId", params?.campaignId || "");
  }

  return apiClient<RollHistoryEntry[]>(`/roll/history?${query.toString()}`, {

  });
}
