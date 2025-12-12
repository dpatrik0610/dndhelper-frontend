import { Badge, Group, TextInput } from "@mantine/core";
import type { InitiativeEntry } from "@store/admin/useInitiativeTrackerStore";

interface InitiativeNameCellProps {
  row: InitiativeEntry;
  disabled: boolean;
  onChange: (value: string) => void;
}

export function InitiativeNameCell({ row, disabled, onChange }: InitiativeNameCellProps) {
  return (
    <Group gap={6}>
      <Badge size="sm" color="violet" variant="light">
        {row.type}
      </Badge>
      <TextInput
        size="xs"
        value={row.name}
        onChange={(e) => onChange(e.currentTarget.value)}
        classNames={{ input: "glassy-input", label: "glassy-label" }}
        disabled={disabled}
      />
    </Group>
  );
}
