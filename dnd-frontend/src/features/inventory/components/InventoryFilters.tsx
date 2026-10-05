import { Select, TextInput, Tooltip } from "@mantine/core";
import { IconArrowsSort, IconLayoutGrid, IconLayoutList, IconSearch } from "@tabler/icons-react";
import type { InventorySort, InventoryViewMode } from "@features/inventory/hooks/useInventoryFilters";
import classes from "./InventoryFilters.module.css";

const SORT_OPTIONS: { value: InventorySort; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "tier", label: "Rarity" },
  { value: "weight", label: "Weight" },
  { value: "quantity", label: "Quantity" },
];

const VIEW_OPTIONS = [
  { value: "list", label: "List view", Icon: IconLayoutList },
  { value: "cards", label: "Grid view", Icon: IconLayoutGrid },
] as const;

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

      <div className={classes.view} role="group" aria-label="Layout">
        {VIEW_OPTIONS.map(({ value, label, Icon }) => (
          <Tooltip key={value} label={label}>
            <button
              type="button"
              className={classes.viewButton}
              aria-label={label}
              aria-pressed={viewMode === value}
              onClick={() => onViewModeChange(value)}
            >
              <Icon size={17} stroke={1.75} />
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
