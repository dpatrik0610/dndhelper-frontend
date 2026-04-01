import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

export function useInventoryFilters() {
  const isMobile = useMediaQuery("(max-width: 768px)");
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
