import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import type { ConditionEntry } from "@store/admin/useInitiativeTrackerStore";
import { AddConditionModal } from "./AddConditionModal";
import { useEffect } from "react";

interface InitiativeConditionsCellProps {
  conditions: ConditionEntry[];
  disabled?: boolean;
  onAdd: (label: string, remaining: number | null) => void;
  onRemove: (conditionId: string) => void;
  openExternally?: boolean;
  onCloseExternal?: () => void;
}

export function InitiativeConditionsCell({
  conditions,
  disabled,
  onAdd,
  onRemove,
  openExternally,
  onCloseExternal,
}: InitiativeConditionsCellProps) {
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (openExternally && !opened) {
      open();
    }
    if (!openExternally && opened && onCloseExternal) onCloseExternal();
  }, [openExternally, opened, open, onCloseExternal]);

  return (
    <>
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
      </Stack>
      <AddConditionModal
        opened={opened}
        onClose={() => {
          close();
          onCloseExternal?.();
        }}
        existingLabels={conditions.map((c) => c.label)}
        onSubmit={(label, duration) => onAdd(label, duration)}
      />
    </>
  );
}
