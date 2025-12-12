import { ActionIcon, Badge, Group, NumberInput, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import type { ConditionEntry } from "@store/admin/useInitiativeTrackerStore";

interface InitiativeConditionsCellProps {
  rowId: string;
  conditions: ConditionEntry[];
  disabled?: boolean;
  onAdd: (label: string, remaining: number | null) => void;
  onRemove: (conditionId: string) => void;
}

export function InitiativeConditionsCell({
  rowId,
  conditions,
  disabled,
  onAdd,
  onRemove,
}: InitiativeConditionsCellProps) {
  const handleAdd = (label: string, duration: number | null) => {
    if (!label.trim()) return;
    onAdd(label.trim(), duration);
  };

  return (
    <Stack gap={4}>
      <Group gap={4} wrap="wrap">
        {conditions.map((cond) => (
          <Badge
            key={cond.id}
            color="red"
            variant="light"
            rightSection={
              <ActionIcon
                size="xs"
                variant="subtle"
                color="red"
                onClick={() => onRemove(cond.id)}
                disabled={disabled}
              >
                <IconX size={10} />
              </ActionIcon>
            }
          >
            {cond.label}
            {cond.remaining !== null ? ` (${cond.remaining})` : ""}
          </Badge>
        ))}
        {conditions.length === 0 && (
          <Text size="xs" c="dimmed">
            No conditions
          </Text>
        )}
      </Group>
      <Group gap={4}>
        <TextInput
          size="xs"
          placeholder="Condition"
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const target = e.currentTarget;
            handleAdd(target.value, null);
            target.value = "";
          }}
        />
        <NumberInput
          size="xs"
          placeholder="Dur."
          min={0}
          max={99}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          disabled={disabled}
          onBlur={(e) => {
            const labelInput = (e.currentTarget.previousSibling as HTMLInputElement) ?? null;
            if (!labelInput) return;
            const label = labelInput.value.trim();
            if (!label) return;
            const val = Number(e.currentTarget.value || 0);
            handleAdd(label, Number.isFinite(val) ? val : null);
            labelInput.value = "";
            e.currentTarget.value = "";
          }}
        />
        <Tooltip label="Add condition">
          <ActionIcon
            size="sm"
            variant="light"
            color="grape"
            onClick={() => {
              const labelInput = document.getElementById(`cond-label-${rowId}`) as HTMLInputElement | null;
              const durInput = document.getElementById(`cond-dur-${rowId}`) as HTMLInputElement | null;
              const label = labelInput?.value.trim() ?? "";
              const val = Number(durInput?.value || 0);
              if (!label) return;
              handleAdd(label, Number.isFinite(val) ? val : null);
              if (labelInput) labelInput.value = "";
              if (durInput) durInput.value = "";
            }}
            disabled={disabled}
          >
            <IconPlus size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  );
}
