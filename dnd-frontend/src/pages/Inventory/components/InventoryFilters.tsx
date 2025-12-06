import { Group, TextInput } from "@mantine/core";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function InventoryFilters({
  searchTerm,
  onSearchChange,
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
    </Group>
  );
}
