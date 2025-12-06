import { useMemo } from "react";
import type { InventoryItem } from "../../../types/Inventory/InventoryItem";

export function useFilteredItems(items: InventoryItem[] | undefined, searchTerm: string) {
  const trimmed = searchTerm.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return (items ?? []).filter((item) => {
      const matchesSearch =
        !trimmed || (item.equipmentName ?? "").toLowerCase().includes(trimmed);
      return matchesSearch;
    });
  }, [items, trimmed]);

  const hasFilters = Boolean(trimmed);
  const hasMatches = filteredItems.length > 0;

  return {
    filteredItems,
    hasFilters,
    hasMatches,
  };
}
