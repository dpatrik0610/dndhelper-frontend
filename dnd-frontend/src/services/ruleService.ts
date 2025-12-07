import { mockRuleDetails, mockRuleSnippets } from "@features/rules/mockRules";
import { type RuleDetail, type RuleListResponse } from "@appTypes/Rules/Rule";

/**
 * Mock rule service. Replacing implementations with real API calls when endpoints are ready.
 */
export async function getRulesListMock(): Promise<RuleListResponse> {
  return {
    items: mockRuleSnippets,
    total: mockRuleSnippets.length,
  };
}

export async function getRuleDetailMock(slug: string): Promise<RuleDetail | null> {
  const detail = mockRuleDetails.find((r) => r.slug === slug);
  return detail ?? null;
}
