import { useEffect, useState } from "react";
import { useIsMobile } from "@hooks/useIsMobile";

export type InventoryViewMode = "list" | "cards";
export type InventorySort = "name" | "tier" | "weight" | "quantity";

export function useInventoryFilters() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<InventorySort>("name");
  const [viewMode, setViewMode] = useState<InventoryViewMode>(
    isMobile ? "list" : "cards"
  );
  const [hasSetViewMode, setHasSetViewMode] = useState(false);

  useEffect(() => {
    if (!hasSetViewMode) {
      setViewMode(isMobile ? "list" : "cards");
    }
  }, [isMobile, hasSetViewMode]);

  const handleViewModeChange = (mode: InventoryViewMode) => {
    setHasSetViewMode(true);
    setViewMode(mode);
  };

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode: handleViewModeChange,
  };
}
