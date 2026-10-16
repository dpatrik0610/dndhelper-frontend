import { Select, TextInput } from "@mantine/core";
import { IconArrowsSort, IconSearch } from "@tabler/icons-react";
import { LayoutToggle } from "@components/common/LayoutToggle";
import type { InventorySort, InventoryViewMode } from "@features/inventory/hooks/useInventoryFilters";
import classes from "./InventoryFilters.module.css";

const SORT_OPTIONS: { value: InventorySort; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "tier", label: "Rarity" },
  { value: "weight", label: "Weight" },
  { value: "quantity", label: "Quantity" },
];

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: InventorySort;
  onSortChange: (sort: InventorySort) => void;
  viewMode: InventoryViewMode;
  onViewModeChange: (mode: InventoryViewMode) => void;
}

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: InventoryFiltersProps) {
  return (
    <div className={classes.toolbar}>
      <TextInput
        aria-label="Search items"
        placeholder="Search by name, tag or note"
        leftSection={<IconSearch size={15} />}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        classNames={{ input: "glassy-input" }}
        className={classes.search}
      />

      <Select
        aria-label="Sort items"
        leftSection={<IconArrowsSort size={15} />}
        data={SORT_OPTIONS}
        value={sortBy}
        onChange={(value) => value && onSortChange(value as InventorySort)}
        allowDeselect={false}
        classNames={{ input: "glassy-input" }}
        className={classes.sort}
      />

      <LayoutToggle value={viewMode} onChange={onViewModeChange} />
    </div>
  );
}
