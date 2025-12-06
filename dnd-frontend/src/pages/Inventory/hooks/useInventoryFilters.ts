import { useState } from "react";

export function useInventoryFilters() {
  const [searchTerm, setSearchTerm] = useState("");

  return {
    searchTerm,
    setSearchTerm,
  };
}
