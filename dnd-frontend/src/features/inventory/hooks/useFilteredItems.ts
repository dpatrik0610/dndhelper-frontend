import { useMemo } from "react";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import { EQUIPMENT_TIERS, type EquipmentTier, type EquipmentUserResponse } from "@appTypes/Equipment/Equipment";
import type { InventorySort } from "./useInventoryFilters";

const tierRank = (tier?: string) => EQUIPMENT_TIERS.indexOf(tier as EquipmentTier);

export function useFilteredItems(
  items: InventoryItem[] | undefined,
  searchTerm: string,
  sortBy: InventorySort,
  details: Map<string, EquipmentUserResponse>
) {
  const trimmed = searchTerm.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    const matches = (items ?? []).filter((item) => {
      if (!trimmed) return true;
      const tags = [...(item.tags ?? []), ...(details.get(item.equipmentId ?? "")?.tags ?? [])];
      return [item.equipmentName, item.note, ...tags].some((text) => text?.toLowerCase().includes(trimmed));
    });

    const info = (item: InventoryItem) => details.get(item.equipmentId ?? "");
    const byName = (a: InventoryItem, b: InventoryItem) => (a.equipmentName ?? "").localeCompare(b.equipmentName ?? "");
    const descending = (key: (item: InventoryItem) => number) => (a: InventoryItem, b: InventoryItem) =>
      key(b) - key(a) || byName(a, b);

    const compare = {
      name: byName,
      tier: descending((item) => tierRank(info(item)?.tier)),
      weight: descending((item) => (info(item)?.weight ?? 0) * (item.quantity ?? 1)),
      quantity: descending((item) => item.quantity ?? 1),
    }[sortBy];

    return matches.sort(compare);
  }, [items, trimmed, sortBy, details]);

  return {
    filteredItems,
    hasFilters: Boolean(trimmed),
  };
}
