import { useState } from "react";
import { useItemLayout } from "@hooks/useItemLayout";

export type InventoryViewMode = "list" | "cards";
export type InventorySort = "name" | "tier" | "weight" | "quantity";

export function useInventoryFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<InventorySort>("name");
  const [viewMode, setViewMode] = useItemLayout("inventoryLayout");

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
  };
}
