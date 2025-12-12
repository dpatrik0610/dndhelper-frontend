import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconDotsVertical, IconPlus, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";

interface InitiativeActionsCellProps {
  rowId: string;
  isCharacter: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onToggleEdit?: (id: string, enable: boolean) => void;
  onApplyEdit?: (id: string) => void;
  onRemove: (id: string) => void;
}

export function InitiativeActionsCell({
  rowId,
  isCharacter,
  isEditing,
  isSaving,
  onToggleEdit,
  onApplyEdit,
  onRemove,
}: InitiativeActionsCellProps) {
  return (
    <Group gap="xs" justify="flex-end" wrap="nowrap" align="center">
      <Tooltip label="More coming soon">
        <ActionIcon size="md" variant="subtle">
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Tooltip>

      {isCharacter && (
        !isEditing ? (
          <Tooltip label="Enable editing">
            <ActionIcon
              size="md"
              variant="light"
              color="blue"
              onClick={() => onToggleEdit?.(rowId, true)}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <>
            <Tooltip label="Apply changes">
              <ActionIcon
                size="md"
                variant="filled"
                color="teal"
                loading={isSaving}
                onClick={() => onApplyEdit?.(rowId)}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Cancel editing">
              <ActionIcon
                size="md"
                variant="subtle"
                color="gray"
                onClick={() => onToggleEdit?.(rowId, false)}
                disabled={isSaving}
              >
                <IconX size={14} />
              </ActionIcon>
            </Tooltip>
          </>
        )
      )}

      <Tooltip label="Remove row">
        <ActionIcon size="md" color="red" variant="light" onClick={() => onRemove(rowId)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
