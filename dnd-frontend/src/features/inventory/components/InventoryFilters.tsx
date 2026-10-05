import { Group, Select, TextInput, SegmentedControl } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import type { InventorySort, InventoryViewMode } from "@features/inventory/hooks/useInventoryFilters";

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
    <Group gap="xs" align="flex-end" wrap="wrap">
      <TextInput
        label="Search items"
        placeholder="Name, tag or note"
        leftSection={<IconSearch size={14} />}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        classNames={{ input: "glassy-input", label: "glassy-label" }}
        style={{ flex: 1, minWidth: 200 }}
      />

      <Select
        label="Sort by"
        data={SORT_OPTIONS}
        value={sortBy}
        onChange={(value) => value && onSortChange(value as InventorySort)}
        allowDeselect={false}
        classNames={{ input: "glassy-input", label: "glassy-label" }}
        w={130}
      />

      <SegmentedControl
        value={viewMode}
        onChange={(value) => onViewModeChange(value as InventoryViewMode)}
        data={[
          { label: "List", value: "list" },
          { label: "Cards", value: "cards" },
        ]}
        size="sm"
        radius="md"
        classNames={{
          root: "glassy-segmented",
          control: "glassy-segmented__control",
          label: "glassy-segmented__label",
        }}
      />
    </Group>
  );
}
