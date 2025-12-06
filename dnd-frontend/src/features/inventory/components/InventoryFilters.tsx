import { Group, TextInput } from "@mantine/core";
import { SegmentedControl } from "@mantine/core";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "list" | "cards";
  onViewModeChange: (mode: "list" | "cards") => void;
}

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: InventoryFiltersProps) {
  return (
    <Group gap="xs" align="flex-end" wrap="wrap">
      <TextInput
        label="Search items"
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        classNames={{ input: "glassy-input", label: "glassy-label" }}
        style={{ flex: 1, minWidth: 200 }}
      />

      <SegmentedControl
        value={viewMode}
        onChange={(value) => onViewModeChange(value as "list" | "cards")}
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
