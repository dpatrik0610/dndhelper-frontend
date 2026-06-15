import { useEffect, useState } from "react";
import { useIsMobile } from "@hooks/useIsMobile";

export function useInventoryFilters() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">(
    isMobile ? "list" : "cards"
  );
  const [hasSetViewMode, setHasSetViewMode] = useState(false);

  useEffect(() => {
    if (!hasSetViewMode) {
      setViewMode(isMobile ? "list" : "cards");
    }
  }, [isMobile, hasSetViewMode]);

  const handleViewModeChange = (mode: "list" | "cards") => {
    setHasSetViewMode(true);
    setViewMode(mode);
  };

  return {
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode: handleViewModeChange,
  };
}
