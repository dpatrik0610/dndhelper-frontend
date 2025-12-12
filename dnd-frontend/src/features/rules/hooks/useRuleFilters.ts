import { useEffect, useMemo } from "react";
import { RuleCategory, type RuleSnippet } from "@appTypes/Rules/Rule";
import { useRulesUiStore } from "../store/useRulesUiStore";

export function useRuleFilters(rules: RuleSnippet[], topic: string, search: string, pageSize = 15) {
  const page = useRulesUiStore((s) => s.page);
  const setPage = useRulesUiStore((s) => s.setPage);

  useEffect(() => {
    setPage(1);
  }, [topic, search, setPage]);

  const filteredRules = useMemo(() => {
    if (!rules?.length) return [];
    const topicNormalized = topic.toLowerCase();
    const hasTopic = topic !== "all";
    const searchNormalized = search.trim().toLowerCase();

    return rules.filter((rule) => {
      const sourceLabel = rule.source?.title?.toLowerCase() ?? "";
      const matchTopic =
        !hasTopic ||
        rule.category.toString().toLowerCase() === topicNormalized ||
        rule.tags.some((tag) => tag.toLowerCase() === topicNormalized) ||
        sourceLabel.includes(topicNormalized);

      if (!matchTopic) return false;

      if (!searchNormalized) return true;
      const haystack = `${rule.title} ${rule.summary} ${rule.category} ${rule.tags.join(" ")}`.toLowerCase();
      return haystack.includes(searchNormalized);
    });
  }, [rules, topic, search]);

  const paginatedRules = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRules.slice(start, start + pageSize);
  }, [filteredRules, page, pageSize]);

  const summaryStats = useMemo(() => {
    const total = rules.length;
    const byCategory = rules.reduce<Record<string, number>>((acc, rule) => {
      const key = rule.category?.toString() ?? RuleCategory.Core;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const tagCounts = rules.reduce<Record<string, number>>((acc, rule) => {
      rule.tags.forEach((t) => {
        const key = t.toLowerCase();
        acc[key] = (acc[key] ?? 0) + 1;
      });
      return acc;
    }, {});
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return { total, byCategory, topTags };
  }, [rules]);

  return { filteredRules, paginatedRules, summaryStats, page, setPage, pageSize };
}
