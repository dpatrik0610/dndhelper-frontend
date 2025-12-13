import { Badge, Group, TextInput } from "@mantine/core";
import type { InitiativeEntry } from "@store/admin/useInitiativeTrackerStore";

interface InitiativeNameCellProps {
  row: InitiativeEntry;
  disabled: boolean;
  onChange: (value: string) => void;
}

export function InitiativeNameCell({ row, disabled, onChange }: InitiativeNameCellProps) {
  const labelByType: Record<InitiativeEntry["type"], string> = {
    character: "PC",
    enemy: "Enemy",
    ally: "Ally",
    environment: "Env",
  };

  const colorByType: Record<InitiativeEntry["type"], string> = {
    character: "blue",
    enemy: "red",
    ally: "teal",
    environment: "yellow",
  };

  return (
    <Group gap={6}>
      <Badge size="sm" color={colorByType[row.type] ?? "gray"} variant="light">
        {labelByType[row.type] ?? row.type}
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
