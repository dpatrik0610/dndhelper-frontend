import { EQUIPMENT_TIERS, type Equipment } from "@appTypes/Equipment/Equipment";
import { convertCostToSilver } from "@utils/currencyConverter";

export type EquipmentSort = "name" | "tier" | "cost";

export interface EquipmentFilters {
  query: string;
  tiers: string[];
  tags: string[];
  customOnly: boolean;
  sort: EquipmentSort;
}

export const EMPTY_FILTERS: EquipmentFilters = { query: "", tiers: [], tags: [], customOnly: false, sort: "name" };

const tierRank = (tier?: string) => Math.max(0, EQUIPMENT_TIERS.indexOf((tier ?? "Common") as (typeof EQUIPMENT_TIERS)[number]));

const comparators: Record<EquipmentSort, (a: Equipment, b: Equipment) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  tier: (a, b) => tierRank(a.tier) - tierRank(b.tier) || a.name.localeCompare(b.name),
  cost: (a, b) => convertCostToSilver(a.cost) - convertCostToSilver(b.cost) || a.name.localeCompare(b.name),
};

export function filterEquipment(items: Equipment[], f: EquipmentFilters): Equipment[] {
  const q = f.query.trim().toLowerCase();
  return items
    .filter(
      (e) =>
        !e.isDeleted &&
        (!f.customOnly || e.isCustom) &&
        (f.tiers.length === 0 || f.tiers.includes(e.tier ?? "Common")) &&
        (f.tags.length === 0 || f.tags.some((t) => e.tags?.includes(t))) &&
        (!q ||
          e.name.toLowerCase().includes(q) ||
          e.index?.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q)))
    )
    .sort(comparators[f.sort]);
}

export function isFiltered(f: EquipmentFilters): boolean {
  return f.query.trim() !== "" || f.tiers.length > 0 || f.tags.length > 0 || f.customOnly;
}
