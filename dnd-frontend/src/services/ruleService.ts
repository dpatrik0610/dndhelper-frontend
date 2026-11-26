import { apiClient } from "@api/apiClient";
import type { Rule, RuleInput } from "@appTypes/Rules/Rule";

export const getRules = async () => (await apiClient<Rule[]>("/rules")) ?? [];

export const createRule = (rule: RuleInput) => apiClient<Rule>("/rules", { method: "POST", body: rule });

export const updateRule = (id: string, rule: RuleInput) =>
  apiClient<Rule>(`/rules/${encodeURIComponent(id)}`, { method: "PUT", body: rule });

export const deleteRule = (id: string) => apiClient<null>(`/rules/${encodeURIComponent(id)}`, { method: "DELETE" });
