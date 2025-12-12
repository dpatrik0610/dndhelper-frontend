import { apiClient } from "@api/apiClient";
import { type RuleCategoryResponse } from "@appTypes/Rules/Rule";

const baseUrl = "/rule-categories";

export async function getRuleCategories(): Promise<RuleCategoryResponse[]> {
  const res = await apiClient<RuleCategoryResponse[] | Record<string, unknown>>(baseUrl, { method: "GET" });
  if (Array.isArray(res)) return res;
  return [];
}

export async function createRuleCategory(
  request: RuleCategoryResponse,
  token: string,
): Promise<RuleCategoryResponse | null> {
  const res = await apiClient<RuleCategoryResponse | Record<string, unknown>>(baseUrl, {
    method: "POST",
    body: request,
    token,
  });
  return (res as RuleCategoryResponse) ?? null;
}
