import { create } from "zustand";
import { getRuleCategories } from "@services/ruleCategoryService";
import { getRulesList } from "@services/ruleService";
import { ruleTopics } from "@features/rules/constants";
import { type RuleSnippet, type RuleCategoryResponse } from "@appTypes/Rules/Rule";

interface RulesDataState {
  rules: RuleSnippet[];
  categories: RuleCategoryResponse[];
  topics: { label: string; value: string }[];
  refreshing: boolean;
  initialized: boolean;
  loadData: () => Promise<void>;
}

export const useRulesDataStore = create<RulesDataState>((set, get) => ({
  rules: [],
  categories: [],
  topics: ruleTopics,
  refreshing: false,
  initialized: false,
  loadData: async () => {
    if (get().refreshing) return;
    set({ refreshing: true });
    try {
      const [rulesRes, catRes] = await Promise.all([getRulesList({ limit: 500 }), getRuleCategories()]);
      const categories = catRes ?? [];
      const dynamicTopics = categories
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((cat) => ({
          label: cat.name,
          value: cat.name,
        }));
      const seen = new Set<string>();
      const mergedTopics = [...ruleTopics, ...dynamicTopics].filter(({ value }) => {
        const key = value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      set({
        rules: rulesRes.items ?? [],
        categories,
        topics: mergedTopics,
        initialized: true,
      });
    } catch (error) {
      console.error("Failed to load rules data:", error);
      set({ rules: [], categories: [], topics: ruleTopics, initialized: true });
    } finally {
      set({ refreshing: false });
    }
  },
}));
