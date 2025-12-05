import { useState } from "react";
import type { Equipment } from "../../../../types/Equipment/Equipment";

export interface FilterState {
  search: string;
  tags: string[];
  damage: string;
  tier: string;
}

const defaultFilters: FilterState = {
  search: "",
  tags: [],
  damage: "",
  tier: "",
};

export function useItemFilters() {
  const [draft, setDraft] = useState<FilterState>(defaultFilters);
  const [applied, setApplied] = useState<FilterState>(defaultFilters);

  const apply = (next?: Partial<FilterState>) => {
    const merged = { ...draft, ...next };
    setDraft(merged);
    setApplied({ ...merged, tags: [...merged.tags] });
    return merged;
  };

  const reset = () => {
    setDraft(defaultFilters);
    setApplied(defaultFilters);
    return defaultFilters;
  };

  const filterItems = (items: Equipment[]) => {
    const searchLower = applied.search.toLowerCase();
    const tagTerms = applied.tags.map((t) => t.toLowerCase()).filter(Boolean);
    const damageLower = applied.damage.toLowerCase();

    return items.filter((eq) => {
      const matchesSearch =
        !searchLower ||
        eq.name?.toLowerCase().includes(searchLower) ||
        eq.index?.toLowerCase().includes(searchLower);

      const matchesTag =
        tagTerms.length === 0 ||
        tagTerms.every((term) => (eq.tags ?? []).some((t) => t.toLowerCase().includes(term)));

      const matchesDamage =
        !damageLower ||
        (eq.damage?.damageDice?.toLowerCase().includes(damageLower) ?? false) ||
        (eq.damage?.damageType?.name?.toLowerCase().includes(damageLower) ?? false);

      const matchesTier = !applied.tier || eq.tier === applied.tier;

      return matchesSearch && matchesTag && matchesDamage && matchesTier;
    });
  };

  return {
    draft,
    applied,
    setDraft,
    apply,
    reset,
    filterItems,
    defaultFilters,
  };
}
