import { useState } from "react";

export function useInventoryFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");

  return {
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
  };
}
